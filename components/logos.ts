// BIC -> logó útvonal (a /public/logos alatt)
// Töltsd fel a képeket a public/logos mappába (png vagy svg)

export const bankLogos: Record<string, string> = {
  // Magyar Államkincstár
  HUSTHUHB: "/logos/magyar-allamkincstar.jpg",

  // OTP Bank
  OTPVHUHB: "/logos/otp.png",

  // Erste Bank
  GIBAHUHB: "/logos/erste.png",   // (Erste Bank Hungary Zrt. BIC-je gyakran ERSTHUHB vagy GIBAHUHB csoportfüggő)
  ERSTHUHB: "/logos/erste.png",

  // CIB Bank
  CIBHHUHB: "/logos/cib.svg",

  // K&H Bank
  OKHBHUHB: "/logos/kh.png",

  // Raiffeisen Bank
  UBRTHUHB: "/logos/raiffeisen.png",

  // UniCredit Bank
  BACXHUHB: "/logos/unicredit.png",

  // MBH Bank (fúzió utáni)
  MKKBHUHB: "/logos/mbh.svg",     // régi MKB
  HBWEHUHB: "/logos/mbh.svg",     // régi Budapest Bank / MBH routingok
  TAKBHUHB: "/logos/mbh.svg",     // régi Takarékbank / MBH routingok
};
