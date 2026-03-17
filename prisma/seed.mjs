import { PrismaClient, SubmissionStatus } from "@prisma/client";

const prisma = new PrismaClient();

const courseSeeds = [
  {
    slug: "ai-daily-report-template",
    title: "让 AI 真正帮你写研发日报：从零散 Prompt 到稳定模板",
    speakerName: "陈小麦",
    durationLabel: "28 分钟",
    eventDate: new Date("2026-03-06T12:00:00+08:00"),
    startTime: "11:00",
    endTime: "11:28",
    summary:
      "主讲人把怎么让 AI 整理 issue、commit、会议纪要并生成日报的流程拆成 3 个可复用步骤，重点是低门槛地每天用起来。",
    replayUrl: "https://intranet.example.com/replay/ai-daily-report-template",
    materialsUrl: "https://intranet.example.com/materials/ai-daily-report-template",
    publishedAt: new Date("2026-03-06T10:00:00+08:00"),
    cardColorType: "peach",
    speakerBio: "平台研发，长期在做内部研发工具和流程效率，这次分享的内容都来自自己一周内真实在用的 Prompt 和整理方式。",
    takeawaysText:
      "一个稳定日报模板，比一次性长 Prompt 更重要。\n先让 AI 提取事实，再整理语气，失真更少。\n最值得起步的是每天省 10 分钟的小复用。",
    feedbackQuotesText:
      "终于不是空泛地讲 AI，而是真的能今天复制一下。\n适合研发同学，尤其是经常要同步进展但又懒得整理的人。",
    tags: ["Prompt 实战", "提效流"]
  },
  {
    slug: "prd-to-task-breakdown",
    title: "把 PRD 先变成任务拆分清单，再开始写代码",
    speakerName: "周舟",
    durationLabel: "22 分钟",
    eventDate: new Date("2026-03-02T12:00:00+08:00"),
    startTime: "14:00",
    endTime: "14:22",
    summary: "讲如何先用 AI 把需求说明书拆成开发任务、风险点和验收口径，减少开工前的信息损耗。",
    replayUrl: "https://intranet.example.com/replay/prd-to-task-breakdown",
    materialsUrl: "https://intranet.example.com/materials/prd-to-task-breakdown",
    publishedAt: new Date("2026-03-02T14:00:00+08:00"),
    cardColorType: "mint",
    speakerBio: "业务研发，擅长把模糊需求收束成团队可执行的结构。",
    takeawaysText:
      "先拆任务再写代码，返工更少。\nAI 更适合做第一轮结构化梳理。\n提前暴露风险点比后补救更划算。",
    feedbackQuotesText:
      "这节很适合带新人一起看。\n需求评审前先跑一遍，大家会更有共识。",
    tags: ["工程提效", "工作流"]
  },
  {
    slug: "ai-code-review-first-pass",
    title: "如何让 AI 帮你做 Code Review 的第一轮筛查",
    speakerName: "李四",
    durationLabel: "30 分钟",
    eventDate: new Date("2026-02-28T12:00:00+08:00"),
    startTime: "16:00",
    endTime: "16:30",
    summary: "分享一套适合研发团队内部使用的 CR 首轮筛查方式，重点是边界感和风险分层。",
    replayUrl: "https://intranet.example.com/replay/ai-code-review-first-pass",
    materialsUrl: "https://intranet.example.com/materials/ai-code-review-first-pass",
    publishedAt: new Date("2026-02-28T16:00:00+08:00"),
    cardColorType: "blue",
    speakerBio: "后端研发负责人，关注质量守门和团队提效之间的平衡。",
    takeawaysText:
      "AI 适合做第一轮异常筛查。\n不要直接把最终判断交给模型。\n风险分类比生成建议更有价值。",
    feedbackQuotesText:
      "这节课把边界说得很清楚。\n适合想引入 AI 又担心误判的团队。",
    tags: ["AI coding", "质量守门"]
  },
  {
    slug: "meeting-notes-to-actions",
    title: "从会议纪要到行动项：内部协作怎么接住 AI",
    speakerName: "Mia",
    durationLabel: "18 分钟",
    eventDate: new Date("2026-02-24T12:00:00+08:00"),
    startTime: "11:00",
    endTime: "11:18",
    summary: "针对开会很多的团队，讲如何让 AI 从纪要里抽出待办、责任人和风险提醒。",
    replayUrl: "https://intranet.example.com/replay/meeting-notes-to-actions",
    materialsUrl: "https://intranet.example.com/materials/meeting-notes-to-actions",
    publishedAt: new Date("2026-02-24T11:00:00+08:00"),
    cardColorType: "cream",
    speakerBio: "项目协作和运营支持背景，长期在做跨团队信息整理。",
    takeawaysText:
      "纪要先结构化，再总结。\n让 AI 抽行动项比写长总结更实用。\n责任人和截止时间必须人工复核。",
    feedbackQuotesText:
      "特别适合会议很多的团队。\n一听完就想回去改自己的纪要模板。",
    tags: ["团队协作", "效率工具"]
  }
];

const submissionSeeds = [
  {
    topic: "用 AI 帮测试同学整理回归结论",
    speakerName: "林安",
    durationLabel: "20 分钟",
    note: "有一套已经连续用了三周的模板，可以直接现场演示。",
    status: SubmissionStatus.NEW
  },
  {
    topic: "把 PRD 先变成任务拆分清单",
    speakerName: "周舟",
    durationLabel: "22 分钟",
    note: "已经讲过一次小范围分享，反馈不错。",
    status: SubmissionStatus.NEED_FOLLOW_UP
  },
  {
    topic: "研发周报自动草稿：从 issue 到统一口径",
    speakerName: "吴桥",
    durationLabel: "25 分钟",
    note: "下周四前都可以讲。",
    status: SubmissionStatus.SCHEDULED
  },
  {
    topic: "如何判断 AI 输出能不能进正式流程",
    speakerName: "许言",
    durationLabel: "15 分钟",
    note: "偏风险判断，适合做短分享。",
    status: SubmissionStatus.NEW
  }
];

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  await prisma.microCourseRelated.deleteMany();
  await prisma.microCourseTag.deleteMany();
  await prisma.microCourse.deleteMany();
  await prisma.talkSubmission.deleteMany();

  const createdCourses = [];

  for (const seed of courseSeeds) {
    const course = await prisma.microCourse.create({
      data: {
        slug: seed.slug || slugify(seed.title),
        title: seed.title,
        speakerName: seed.speakerName,
        durationLabel: seed.durationLabel,
        eventDate: seed.eventDate,
        startTime: seed.startTime,
        endTime: seed.endTime,
        summary: seed.summary,
        replayUrl: seed.replayUrl,
        materialsUrl: seed.materialsUrl,
        publishedAt: seed.publishedAt,
        cardColorType: seed.cardColorType,
        speakerBio: seed.speakerBio,
        takeawaysText: seed.takeawaysText,
        feedbackQuotesText: seed.feedbackQuotesText,
        tags: {
          create: seed.tags.map((tagName) => ({ tagName }))
        }
      }
    });

    createdCourses.push(course);
  }

  const relatedPairs = [
    [createdCourses[0], createdCourses[1]],
    [createdCourses[0], createdCourses[2]],
    [createdCourses[0], createdCourses[3]]
  ];

  for (const [course, relatedCourse] of relatedPairs) {
    await prisma.microCourseRelated.create({
      data: {
        courseId: course.id,
        relatedCourseId: relatedCourse.id
      }
    });
  }

  await prisma.talkSubmission.createMany({
    data: submissionSeeds
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
