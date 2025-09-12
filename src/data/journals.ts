export type Journal = {
  journalName: string;
  year: number;
  issn: string;
  review: string;
  oaj: string;
  openAccess: string;
  webOfScience: string;
  impactFactor: number | string;
  annotation: string;
  majorCategory: string;
  majorCategoryPartition: string;
  top: string;
  authorityJournal: string;
  minorCategories: { name: string; partition: string }[];
};

export const journals: Journal[] = [
  {
    journalName: "JOURNAL OF ARCHAEOLOGICAL RESEARCH",
    year: 2025,
    issn: "1059-0161/1573-7756",
    review: "否",
    oaj: "否",
    openAccess: "否",
    webOfScience: "SSCI;AHCI",
    impactFactor: 4.1,
    annotation: "",
    majorCategory: "历史学",
    majorCategoryPartition: "1 [1/778]",
    top: "是",
    authorityJournal: "一级",
    minorCategories: [
      { name: "ANTHROPOLOGY 人类学", partition: "1 [1/137]" },
      { name: "ARCHAEOLOGY 考古学", partition: "1 [1/164]" },
    ],
  },
  {
    journalName: "JOURNAL OF WORLD PREHISTORY",
    year: 2025,
    issn: "0892-7537/1573-7802",
    review: "否",
    oaj: "否",
    openAccess: "否",
    webOfScience: "SSCI;AHCI",
    impactFactor: 3.1,
    annotation: "",
    majorCategory: "历史学",
    majorCategoryPartition: "1 [2/778]",
    top: "是",
    authorityJournal: "一级",
    minorCategories: [
      { name: "ANTHROPOLOGY 人类学", partition: "1 [2/137]" },
      { name: "ARCHAEOLOGY 考古学", partition: "1 [2/164]" },
    ],
  },
  {
    journalName: "JOURNAL OF ARCHAEOLOGICAL METHOD AND THEORY",
    year: 2025,
    issn: "1072-5369/1573-7764",
    review: "否",
    oaj: "否",
    openAccess: "否",
    webOfScience: "SSCI;AHCI",
    impactFactor: 2.8,
    annotation: "",
    majorCategory: "历史学",
    majorCategoryPartition: "1 [3/778]",
    top: "是",
    authorityJournal: "一级",
    minorCategories: [
      { name: "ANTHROPOLOGY 人类学", partition: "1 [5/137]" },
      { name: "ARCHAEOLOGY 考古学", partition: "1 [3/164]" },
    ],
  },
  {
    journalName: "NATURE",
    year: 2025,
    issn: "0028-0836",
    review: "是",
    oaj: "是",
    openAccess: "是",
    webOfScience: "SCIE",
    impactFactor: 64.8,
    annotation: "Top-tier multidisciplinary journal",
    majorCategory: "综合性期刊",
    majorCategoryPartition: "1 [1/100]",
    top: "是",
    authorityJournal: "顶级",
    minorCategories: [
      { name: "MULTIDISCIPLINARY SCIENCES", partition: "1 [1/73]" },
    ],
  },
  {
    journalName: "SCIENCE",
    year: 2025,
    issn: "0036-8075",
    review: "是",
    oaj: "是",
    openAccess: "否",
    webOfScience: "SCIE",
    impactFactor: 56.9,
    annotation: "Top-tier multidisciplinary journal",
    majorCategory: "综合性期刊",
    majorCategoryPartition: "1 [2/100]",
    top: "是",
    authorityJournal: "顶级",
    minorCategories: [
      { name: "MULTIDISCIPLINARY SCIENCES", partition: "1 [2/73]" },
    ],
  },
];
