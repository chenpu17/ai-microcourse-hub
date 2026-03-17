import { SubmissionStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { splitLines, toDateInputValue } from "@/lib/utils";

const PAGE_SIZE = 16;
const ACTIVE_SUBMISSION_STATUSES = [
  SubmissionStatus.NEW,
  SubmissionStatus.NEED_FOLLOW_UP,
  SubmissionStatus.SCHEDULED
];
const COMPLETED_SUBMISSION_STATUSES = [
  SubmissionStatus.ARCHIVED,
  SubmissionStatus.REJECTED
];

function normalizeSubmissionView(value?: string) {
  if (value === "all" || value === "done") {
    return value;
  }

  return "active";
}

export async function getHomepageData(page: number) {
  const currentPage = Math.max(page, 1);
  const [items, total, latest] = await Promise.all([
    prisma.microCourse.findMany({
      orderBy: { publishedAt: "desc" },
      include: { tags: true },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE
    }),
    prisma.microCourse.count(),
    prisma.microCourse.findMany({
      orderBy: { publishedAt: "desc" },
      include: { tags: true },
      take: 4
    })
  ]);

  return {
    items,
    latest,
    page: currentPage,
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    pageSize: PAGE_SIZE
  };
}

export async function getCourseBySlug(slug: string) {
  const slugCandidates = [slug];

  try {
    const decodedSlug = decodeURIComponent(slug);

    if (!slugCandidates.includes(decodedSlug)) {
      slugCandidates.push(decodedSlug);
    }
  } catch {
    // Ignore malformed slug input and fall back to the raw value.
  }

  const course = await prisma.microCourse.findFirst({
    where: {
      slug: {
        in: slugCandidates
      }
    },
    include: {
      tags: true,
      relatedFrom: {
        include: {
          relatedCourse: {
            include: { tags: true }
          }
        }
      }
    }
  });

  if (!course) {
    return null;
  }

  return {
    ...course,
    materialLinks: splitLines(course.materialsUrl),
    takeaways: splitLines(course.takeawaysText),
    feedbackQuotes: splitLines(course.feedbackQuotesText),
    relatedCourses: course.relatedFrom.map((item) => item.relatedCourse)
  };
}

export async function getAdminDashboardData(options?: {
  archiveFromId?: string;
  submissionView?: string;
}) {
  const submissionView = normalizeSubmissionView(options?.submissionView);
  const submissionWhere =
    submissionView === "all"
      ? undefined
      : {
          status: {
            in:
              submissionView === "done"
                ? COMPLETED_SUBMISSION_STATUSES
                : ACTIVE_SUBMISSION_STATUSES
          }
        };

  const [
    submissions,
    courses,
    archiveLedger,
    allCourses,
    statusCounts,
    archivedCourses,
    archiveSource
  ] =
    await Promise.all([
      prisma.talkSubmission.findMany({
        where: submissionWhere,
        orderBy: { createdAt: "desc" }
      }),
      prisma.microCourse.findMany({
        orderBy: { publishedAt: "desc" },
        take: 4
      }),
      prisma.microCourse.findMany({
        include: { tags: true },
        orderBy: [{ eventDate: "desc" }, { publishedAt: "desc" }],
        take: 16
      }),
      prisma.microCourse.findMany({
        orderBy: { publishedAt: "desc" },
        select: {
          id: true,
          title: true,
          speakerName: true
        }
      }),
      prisma.talkSubmission.groupBy({
        by: ["status"],
        _count: {
          _all: true
        }
      }),
      prisma.microCourse.count(),
      options?.archiveFromId
        ? prisma.talkSubmission.findUnique({
            where: { id: options.archiveFromId }
          })
        : Promise.resolve(null)
    ]);

  const counts = new Map(statusCounts.map((item) => [item.status, item._count._all]));
  const activeSubmissions = ACTIVE_SUBMISSION_STATUSES.reduce(
    (total, status) => total + (counts.get(status) ?? 0),
    0
  );
  const completedSubmissions = COMPLETED_SUBMISSION_STATUSES.reduce(
    (total, status) => total + (counts.get(status) ?? 0),
    0
  );

  return {
    submissions,
    recentCourses: courses,
    archiveLedger,
    allCourses,
    archiveSource,
    submissionView,
    metrics: {
      activeSubmissions,
      completedSubmissions,
      newSubmissions: counts.get(SubmissionStatus.NEW) ?? 0,
      scheduled: counts.get(SubmissionStatus.SCHEDULED) ?? 0,
      archivedCourses
    }
  };
}

export async function getEditableCourse(courseId?: string) {
  if (!courseId) {
    return null;
  }

  const course = await prisma.microCourse.findUnique({
    where: { id: courseId },
    include: {
      tags: true,
      relatedFrom: true
    }
  });

  if (!course) {
    return null;
  }

  return {
    ...course,
    eventDateValue: toDateInputValue(course.eventDate),
    startTime: course.startTime,
    endTime: course.endTime,
    tagNames: course.tags.map((tag) => tag.tagName),
    relatedIds: course.relatedFrom.map((item) => item.relatedCourseId)
  };
}
