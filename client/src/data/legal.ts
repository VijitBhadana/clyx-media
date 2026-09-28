// Copy for the Privacy Policy (/privacy) and Terms of Use (/terms) pages, rendered by pages/LegalPage.tsx.
// A paragraph starting with "- " lines is shown as a bulleted list; "**Label:** text" makes the label bold.
// Update `updated` whenever the wording changes.

export type LegalSection = { id: string; title: string; body: string[] };
export type LegalDoc = {
  path: '/privacy' | '/terms';
  label: string;
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
};

const CONTACT_EMAIL = 'work@clyxmedia.com';

export const privacy: LegalDoc = {
  path: '/privacy',
  label: 'Privacy Policy',
  title: 'Privacy Policy',
  intro: 'What we collect when you use clyxmedia.com or get in touch with us, why we collect it, and the choices you have. No jargon where we can avoid it.',
  updated: '28 September 2026',
  sections: [
    {
      id: 'who-we-are',
      title: 'Who we are',
      body: [
        'CLYX Media (“CLYX”, “we”, “us”) is a performance creative and growth marketing agency. This policy covers the personal information we handle through our website, clyxmedia.com (the “site”), and when you contact us about our services or a job.',
        `If you have any question about this policy or your information, write to us at ${CONTACT_EMAIL}.`,
      ],
    },
    {
      id: 'what-we-collect',
      title: 'Information we collect',
      body: [
        '**Information you give us.** When you email us, message us on WhatsApp, book a call or fill in a form on the site, we receive what you choose to share — usually your name, email address, phone number, company and message.',
        '**Job applications.** When you apply through the Careers page we receive your name, email address, phone number, the role you are applying for, any note you add and your resume. The application is emailed straight to our hiring team; the resume is not stored on the website’s servers.',
        '**Technical information.** Like every website, our hosting providers keep standard server logs — such as IP address, browser type, the pages requested and the time of the request — to keep the site secure and running. We do not run advertising trackers or third-party analytics on the site.',
        '**Stored on your device.** The site uses your browser’s local storage to remember two things: that you have seen the cookie notice, and whether you prefer light or dark mode. This stays in your browser and is not used to identify you.',
      ],
    },
    {
      id: 'how-we-use',
      title: 'How we use it',
      body: [
        'We use your information only to:',
        '- reply to your enquiry and send proposals you ask for\n- deliver the services you engage us for\n- review job applications and contact candidates\n- keep the site secure, fix problems and improve it\n- meet our legal and accounting obligations',
        'We do not sell your personal information, and we do not use it for advertising.',
      ],
    },
    {
      id: 'sharing',
      title: 'Who we share it with',
      body: [
        'We share information only with the service providers that help us run the site and talk to you, and only as much as they need:',
        '- **Hosting and infrastructure:** Vercel, Render and Supabase\n- **Email delivery:** Resend, which sends form emails such as job applications to our team\n- **Tools you choose to use:** WhatsApp, Calendly, Instagram or LinkedIn, when you reach us through them',
        'Each provider handles data under its own privacy policy. We may also disclose information when the law requires it, or to a successor if CLYX Media is ever merged or sold, in which case this policy would continue to apply.',
      ],
    },
    {
      id: 'retention',
      title: 'How long we keep it',
      body: [
        'We keep enquiries and client correspondence for as long as they are needed to respond to you and for our working relationship, and longer only where the law requires records to be kept. We keep job applications while the hiring process is open and for a reasonable time afterwards in case a matching role comes up. You can ask us to delete your information at any time.',
      ],
    },
    {
      id: 'your-rights',
      title: 'Your rights',
      body: [
        'Under applicable data protection law, including India’s Digital Personal Data Protection Act, 2023, you can ask us to:',
        '- tell you what personal information we hold about you\n- correct information that is wrong or out of date\n- delete your information\n- withdraw consent you have given us',
        `Email ${CONTACT_EMAIL} with your request and we will respond as soon as we reasonably can. We may need to confirm your identity first.`,
      ],
    },
    {
      id: 'security',
      title: 'Security',
      body: [
        'The site is served over HTTPS and access to our systems is limited to the people who need it. No method of sending or storing data is completely secure, but we take reasonable steps to protect the information you share with us.',
      ],
    },
    {
      id: 'other-sites',
      title: 'Links to other sites',
      body: [
        'The site links to other services such as Instagram, LinkedIn, WhatsApp and Calendly. Once you leave our site, their own privacy policies apply, and we are not responsible for how they handle your information.',
      ],
    },
    {
      id: 'changes',
      title: 'Changes to this policy',
      body: [
        'We may update this policy as the site or the law changes. The date at the top of this page shows when it was last updated, and the current version always applies.',
      ],
    },
  ],
};

export const terms: LegalDoc = {
  path: '/terms',
  label: 'Terms of Use',
  title: 'Terms of Use',
  intro: 'The ground rules for using clyxmedia.com. Work we do for clients is covered by a separate written agreement, not by these terms.',
  updated: '28 September 2026',
  sections: [
    {
      id: 'acceptance',
      title: 'Using this site',
      body: [
        'These terms apply to your use of clyxmedia.com (the “site”), run by CLYX Media (“CLYX”, “we”, “us”). By using the site you agree to them. If you do not agree, please do not use the site.',
      ],
    },
    {
      id: 'about-the-site',
      title: 'What the site is for',
      body: [
        'The site describes CLYX Media, our services and our work. Its content is general information, not an offer or a binding quote. Any engagement with us is governed by the proposal or agreement we sign with you, and if that agreement differs from anything on the site, the agreement wins.',
      ],
    },
    {
      id: 'acceptable-use',
      title: 'Acceptable use',
      body: [
        'When using the site, you agree not to:',
        '- use it for anything unlawful, misleading or harmful\n- try to access areas you are not authorised to use, including the admin area\n- interfere with the site’s security or performance, or upload malicious files\n- copy or scrape the site’s content in bulk\n- submit false information or someone else’s details through our forms',
      ],
    },
    {
      id: 'intellectual-property',
      title: 'Our content',
      body: [
        'The CLYX name and logo, the site’s design and its text are owned by CLYX Media. Campaign work, creator images and brand assets shown in our portfolio, case studies and creator gallery belong to their respective owners and appear with their permission.',
        'You may view and share links to the site, but you may not copy, reuse or republish its content without our written permission.',
      ],
    },
    {
      id: 'submissions',
      title: 'What you send us',
      body: [
        'When you contact us or apply for a job, you confirm that the information you send is accurate and that you are allowed to share it. We handle it as described in our Privacy Policy.',
      ],
    },
    {
      id: 'results',
      title: 'Results and case studies',
      body: [
        'Figures shown on the site — such as ROAS, CTR, reach or revenue — describe results from specific past campaigns. They are examples, not promises: every brand, budget and market is different, and we do not guarantee any particular result.',
      ],
    },
    {
      id: 'third-parties',
      title: 'Third-party links',
      body: [
        'The site links to services we do not control, such as Instagram, LinkedIn, WhatsApp and Calendly. We are not responsible for their content or practices, and their own terms apply when you use them.',
      ],
    },
    {
      id: 'disclaimer',
      title: 'No warranty',
      body: [
        'We work to keep the site accurate and available, but it is provided “as is”. We do not promise that it will always be available, error-free or up to date.',
      ],
    },
    {
      id: 'liability',
      title: 'Limitation of liability',
      body: [
        'To the extent the law allows, CLYX Media is not liable for any indirect or consequential loss arising from your use of the site or from relying on its content. Nothing in these terms limits liability that cannot be limited by law.',
      ],
    },
    {
      id: 'changes',
      title: 'Changes to these terms',
      body: [
        'We may update these terms from time to time. The date at the top of this page shows when they were last updated, and continuing to use the site means you accept the current version.',
      ],
    },
    {
      id: 'governing-law',
      title: 'Governing law',
      body: [
        'These terms are governed by the laws of India, and any dispute about them will be handled by the courts of India.',
      ],
    },
  ],
};

export const legalContactEmail = CONTACT_EMAIL;
