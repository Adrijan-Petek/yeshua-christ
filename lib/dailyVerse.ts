export type Verse = {
  reference: string;
  text: string;
  translation_name: string;
};

const OFFLINE_VERSE_POOL: Verse[] = [
  {
    reference: "John 3:16",
    text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
    translation_name: "KJV",
  },
  {
    reference: "Psalm 23:1",
    text: "The LORD is my shepherd; I shall not want.",
    translation_name: "KJV",
  },
  {
    reference: "Proverbs 3:5",
    text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding.",
    translation_name: "KJV",
  },
  {
    reference: "Proverbs 3:6",
    text: "In all thy ways acknowledge him, and he shall direct thy paths.",
    translation_name: "KJV",
  },
  {
    reference: "Philippians 4:6",
    text: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.",
    translation_name: "KJV",
  },
  {
    reference: "Philippians 4:7",
    text: "And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.",
    translation_name: "KJV",
  },
  {
    reference: "Romans 8:28",
    text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
    translation_name: "KJV",
  },
  {
    reference: "Isaiah 41:10",
    text: "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.",
    translation_name: "KJV",
  },
  {
    reference: "Matthew 11:28",
    text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.",
    translation_name: "KJV",
  },
  {
    reference: "2 Corinthians 5:17",
    text: "Therefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new.",
    translation_name: "KJV",
  },
  {
    reference: "Psalm 46:10",
    text: "Be still, and know that I am God: I will be exalted among the heathen, I will be exalted in the earth.",
    translation_name: "KJV",
  },
  {
    reference: "Hebrews 11:1",
    text: "Now faith is the substance of things hoped for, the evidence of things not seen.",
    translation_name: "KJV",
  },
  {
    reference: "James 1:5",
    text: "If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him.",
    translation_name: "KJV",
  },
  {
    reference: "1 Peter 5:7",
    text: "Casting all your care upon him; for he careth for you.",
    translation_name: "KJV",
  },
  {
    reference: "Romans 5:8",
    text: "But God commendeth his love toward us, in that, while we were yet sinners, Christ died for us.",
    translation_name: "KJV",
  },
  {
    reference: "John 14:6",
    text: "Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me.",
    translation_name: "KJV",
  },
  {
    reference: "Joshua 1:9",
    text: "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.",
    translation_name: "KJV",
  },
  {
    reference: "Psalm 119:105",
    text: "Thy word is a lamp unto my feet, and a light unto my path.",
    translation_name: "KJV",
  },
  {
    reference: "Romans 12:2",
    text: "And be not conformed to this world: but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God.",
    translation_name: "KJV",
  },
  {
    reference: "Galatians 2:20",
    text: "I am crucified with Christ: nevertheless I live; yet not I, but Christ liveth in me: and the life which I now live in the flesh I live by the faith of the Son of God, who loved me, and gave himself for me.",
    translation_name: "KJV",
  },
  {
    reference: "1 John 1:9",
    text: "If we confess our sins, he is faithful and just to forgive us our sins, and to cleanse us from all unrighteousness.",
    translation_name: "KJV",
  },
  {
    reference: "Ephesians 2:8",
    text: "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God:",
    translation_name: "KJV",
  },
  {
    reference: "Ephesians 2:9",
    text: "Not of works, lest any man should boast.",
    translation_name: "KJV",
  },
  {
    reference: "Psalm 34:8",
    text: "O taste and see that the LORD is good: blessed is the man that trusteth in him.",
    translation_name: "KJV",
  },
  {
    reference: "John 1:1",
    text: "In the beginning was the Word, and the Word was with God, and the Word was God.",
    translation_name: "KJV",
  },
  {
    reference: "John 1:14",
    text: "And the Word was made flesh, and dwelt among us, (and we beheld his glory, the glory as of the only begotten of the Father,) full of grace and truth.",
    translation_name: "KJV",
  },
  {
    reference: "Psalm 37:4",
    text: "Delight thyself also in the LORD; and he shall give thee the desires of thine heart.",
    translation_name: "KJV",
  },
  {
    reference: "Matthew 6:33",
    text: "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.",
    translation_name: "KJV",
  },
  {
    reference: "Hebrews 13:5",
    text: "Let your conversation be without covetousness; and be content with such things as ye have: for he hath said, I will never leave thee, nor forsake thee.",
    translation_name: "KJV",
  },
  {
    reference: "John 15:13",
    text: "Greater love hath no man than this, that a man lay down his life for his friends.",
    translation_name: "KJV",
  },
  {
    reference: "Psalm 27:1",
    text: "The LORD is my light and my salvation; whom shall I fear? the LORD is the strength of my life; of whom shall I be afraid?",
    translation_name: "KJV",
  },
  {
    reference: "Isaiah 53:5",
    text: "But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed.",
    translation_name: "KJV",
  },
  {
    reference: "Romans 10:9",
    text: "That if thou shalt confess with thy mouth the Lord Jesus, and shalt believe in thine heart that God hath raised him from the dead, thou shalt be saved.",
    translation_name: "KJV",
  },
  {
    reference: "Romans 10:10",
    text: "For with the heart man believeth unto righteousness; and with the mouth confession is made unto salvation.",
    translation_name: "KJV",
  },
];

export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function getOfflineDailyVerse(dateKey: string): Verse {
  const index = hashString(dateKey) % OFFLINE_VERSE_POOL.length;
  return OFFLINE_VERSE_POOL[index] ?? OFFLINE_VERSE_POOL[0]!;
}

export function toDailyBiblePath(reference: string): string {
  return reference.trim().replace(/\s+/g, "+");
}

