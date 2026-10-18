import type { Locale } from "../i18n"

export interface LegalDocument {
  title: string
  intro: string
  date: string
  sections: { heading: string; body: string }[]
}

/**
 * The two extra legal documents that sit alongside the privacy and cookie
 * notices already in `ar.ts` / `en.ts`.
 *
 * Everything here is written for a site that operates in Turkey and is
 * therefore subject to Turkish law, most importantly the Personal Data
 * Protection Law (KVKK, Law No. 6698), the Turkish Civil Code on authority to
 * sell real estate (TMK Art. 706), the Law on Commercial Advertising and
 * Disclosure Rights (No. 6563), and the mandatory Electronic Listing
 * Verification System (EİDS).
 *
 * These pages are not a substitute for advice from a Turkish lawyer; they are
 * written to tell visitors plainly what we do with their data and what we
 * expect from anyone who lists a property.
 */

export const termsOfUse: Record<Locale, LegalDocument> = {
  ar: {
    title: "شروط الاستخدام",
    intro: "تصف هذه الشروط شروط استخدام موقع إسكان العقاري. وباستخدامك الموقع فإنك توافق عليها. الموقع يعمل في تركيا ويخضع للتشريعات التركية، وبالذات قانون حماية البيانات الشخصية.",
    date: "آخر تحديث: أكتوبر 2026",
    sections: [
      {
        heading: "1. من نحن",
        body: "موقع إسكان العقاري منصة لإعلانات العقارات في تركيا. نحن من ينشر الإعلانات، ولسنا طرفاً في أي عقد بيع أو إيجار يتم بين المعلن والمشتري أو المستأجر. أي اتفاق يتم مباشرة بين الأطراف المعنية.",
      },
      {
        heading: "2. استخدام الموقع",
        body: "يحق لك تصفح الموقع وقراءة الإعلانات وإرسال إعلان. لا يحق لك نسخ الإعلانات أو الصور أو الفيديوهات لأغراض تجارية، ولا إعادة نشرها، ولا محاولة الوصول إلى أي جزء تقني من الموقع غير مخصص لك.",
      },
      {
        heading: "3. حسابك ومسؤوليتك",
        body: "إنشاء الحساب يتطلب بيانات صحيحة: اسمك، واسمك الكامل، وجنسك، وجنسيتك، وإما بريدك الإلكتروني أو رقم هاتفك، وكلمة سر قوية. أنت وحدك المسؤول عن سرّية كلمة السر وعن كل نشاط يتم من خلال حسابك. وإذا أخبرت أحداً بكلمة السر فأنت مسؤول عن كل ما ينتج عن ذلك.",
      },
      {
        heading: "4. من يحق له نشر إعلان",
        body: "يجوز نشر إعلان للعقار ممن يملكه، أو من يملك توكيلاً خاصاً به من المالك. ووفق المادة 706 من القانون المدني التركي لا يجوز نقل ملكية عقار إلا بحضور المالك أو من ينيب عنه بتوكيل خاص. ونتحقق من ذلك عند الطلب قبل نشر إعلان للبيع.",
      },
      {
        heading: "5. لا ننشر إلا بعد مراجعة",
        body: "كل إعلان، سواء كان جديداً أو تعديلاً على إعلان منشور، يمر على مراجعة يدوية من فريقنا قبل النشر. ويحق لنا رفض أي إعلان أو تعديله، أو حذفه لاحقاً إذا تبيّن أنه مخالف أو مضلّل، وذلك دون أي التزام بإعطائك سبب.",
      },
      {
        heading: "6. المحتويات الممنوعة",
        body: "يُمنع نشر أي محتوى مخالف للقوانين التركية أو للأوامر القضائية، أو يحتوي على تشهير أو سبّ أو تحرّش أو تمييز، أو ينتحل صفة شخص أو جهة أخرى، أو يروّج لسلعة أو خدمة تتطلب ترخيصاً لا تملكه.",
      },
      {
        heading: "7. الأسعار",
        body: "الأسعار المعروضة هي سعر معلن من المعلن وليست عرضاً من إسكان. وهي لا تشمل عادةً التكاليف مثل رسوم نقل الملكية أو ضريبة القيمة المضافة أو رسوم الصيانة، إلا إذا ذُكر ذلك صراحة. والأسعار قابلة للتغيير في أي وقت دون إشعار مسبق.",
      },
      {
        heading: "8. الصور والفيديوهات",
        body: "يجب أن تكون الصور والفيديوهات حقيقية وعائدة إلى العقار المعلن. ويُمنع استخدام صور جاهزة من مواقع أخرى أو صور أُنتجت بالذكاء الاصطناعي، أو صور عقار آخر. ونحق لنا طلب دليل على الملكية أو التوكيل، والحفاظ على ذلك الدليل مسؤولية المعلن.",
      },
      {
        heading: "9. الملكية الفكرية",
        body: "الموقع واسمه وشعاره وواجهته مملوكة لنا. أما الإعلانات فتبقى ملكية معلنها، لكن بنشره أنت تمنحنا الترخيص المحدود اللازم لعرضها والترويج لها ضمن الموقع.",
      },
      {
        heading: "10. إخلاء المسؤولية",
        body: "نقدّم الموقع كما هو دون ضمان خلوّه من الأخطاء أو الانقطاع، ولا نضمن دقة ما ينشره المستخدمون. ولا نتحمل مسؤولية أي خسارة ناتجة عن التعامل بينك وبين المعلن، بما في ذلك ترحيل الأموال إلى مالك أو وكيل بناءً على إعلان. وأي معاملة تتم خارج الموقع هي على مسؤوليتك وحدك.",
      },
      {
        heading: "11. إنهاء الاستخدام",
        body: "يحق لنا تعليق أو حذف أي حساب أو إعلان إذا خالف هذه الشروط، أو بناءً على بلاغ من مستخدم آخر، أو بناءً على طلب من جهة رسمية. ويجوز لك حذف حسابك بنفسك في أي وقت.",
      },
      {
        heading: "12. القانون الواجب التطبيق",
        body: "تخضع هذه الشروط لقوانين جمهورية تركيا، وتُفسر وفقاً لها. وأي نزاع يُحال أولاً إلى تسوية ودية، وإلا إلى الهيئات القضائية المختصة في تركيا.",
      },
    ],
  },
  en: {
    title: "Terms of Use",
    intro:
      "These terms govern your use of the Iskan Real Estate website. By using the site you accept them. Iskan operates in Turkey and is subject to Turkish law, most importantly the Personal Data Protection Law (KVKK, Law No. 6698).",
    date: "Last updated: October 2026",
    sections: [
      {
        heading: "1. Who we are",
        body: "Iskan Real Estate is a listings platform for property in Turkey. We publish the listings; we are not a party to any sale or rental contract concluded between an advertiser and a buyer or tenant. Any such transaction is made directly between the parties concerned.",
      },
      {
        heading: "2. Using the site",
        body: "You may browse the site, read listings and post a listing. You may not copy listings, images or videos for commercial use, republish them, or attempt to reach any part of the site's technical infrastructure that is not intended for you.",
      },
      {
        heading: "3. Your account and your responsibility",
        body: "Creating an account requires accurate details: your display name, full name, gender, nationality, and either an email address or a phone number, plus a strong password. You are solely responsible for keeping that password secret and for everything done through your account. If you give someone your password, you are responsible for what they do with it.",
      },
      {
        heading: "4. Who may list a property",
        body: "A property may be listed by its owner, or by someone holding a specific power of attorney from the owner. Under Article 706 of the Turkish Civil Code, ownership of real estate can only be transferred with the owner present or represented by a special power of attorney. We verify this on request before publishing any listing offered for sale.",
      },
      {
        heading: "5. Nothing is published without review",
        body: "Every listing, whether it is brand new or an edit to a live one, goes through a manual review by our team before it appears. We may decline or amend any listing or edit, or remove it later if it turns out to be non-compliant or misleading, without any obligation to give you a reason.",
      },
      {
        heading: "6. Prohibited content",
        body: "You may not publish anything that breaks Turkish law or a court order, that is defamatory, abusive, harassing or discriminatory, that impersonates another person or organisation, or that advertises a product or service that requires a licence you do not hold.",
      },
      {
        heading: "7. Prices",
        body: "Displayed prices are prices advertised by the advertiser, not an offer from Iskan. They normally exclude costs such as title-deed transfer fees, VAT or building maintenance charges unless stated explicitly. Prices may change at any time without notice.",
      },
      {
        heading: "8. Images and videos",
        body: "Images and videos must be genuine and must show the property being advertised. Stock photos taken from other sites, AI-generated visuals, and photos of someone else's property are not allowed. We may ask for proof of ownership or authority, and keeping that proof is the advertiser's own responsibility.",
      },
      {
        heading: "9. Intellectual property",
        body: "The site, its name, logo and interface belong to us. Listings remain the property of their advertiser, but by posting you grant us the limited licence needed to display and promote them on the site.",
      },
      {
        heading: "10. Disclaimer",
        body: "The site is provided as is, without any guarantee that it is error-free or uninterrupted, and we do not warrant the accuracy of what users publish. We are not liable for any loss arising from dealings between you and an advertiser, including money sent to a landlord or agent on the basis of a listing. Any transaction carried out outside the site is entirely at your own risk.",
      },
      {
        heading: "11. Suspension and termination",
        body: "We may suspend or delete any account or listing that breaks these terms, that is reported by another user, or that a Turkish authority asks us to remove. You may delete your own account at any time.",
      },
      {
        heading: "12. Governing law",
        body: "These terms are governed by the laws of the Republic of Türkiye and construed in accordance with them. Disputes are first referred for amicable settlement and otherwise fall under the competent courts of Türkiye.",
      },
    ],
  },
}

export const listingRules: Record<Locale, LegalDocument> = {
  ar: {
    title: "قواعد نشر الإعلانات العقارية",
    intro: "هذه الشواعد إلزامية على كل من ينشر إعلاناً عن عقار في إسكان العقاري. والإعلان عن العقارات في تركيا منظّم قانوناً، وفيما يلي ما نتحقق منه قبل النشر.",
    date: "آخر تحديث: أكتوبر 2026",
    sections: [
      {
        heading: "1. إثبات الصفة",
        body: "أنت تقرّ بأنك مالك العقار، أو أنك تملك توكيلاً من المالك يتيح لك الإعلان عنه. وعند طلبنا المستندات مثل عقد الملكية أو التوكيل تلتزم بتقديمها، وإلا أوقفنا الإعلان. ووفق المادة 706 من القانون المدني التركي، التوكيل الخاص شرط لبيع العقار.",
      },
      {
        heading: "2. التصريح عن حالة السند",
        body: "يجب أن تصرّح بدقة عن حالة سند الملكية، وعن وضع مالك العقار من حيث الجنسية. والتصريح الخاطئ يعرّضك للمساءلة القانونية ويسقط الإعلان.",
      },
      {
        heading: "3. نظام التحقق الإلكتروني",
        body: "منذ 15 شباط (فبراير) 2026 أصبح نظام التحقق الإلكتروني من الإعلانات إلزامياً لجميع إعلانات العقارات في تركيا، بما فيها إعلانات البيع. ونطلب منك الاسم الكامل للمالك ورقم هاتفه ليتم التحقق، ويلتزم صاحب العقار بمنح إذن النشر لمدة لا تقل عن ثلاثة أشهر.",
      },
      {
        heading: "4. البيانات الواجب ذكرها",
        body: "كل إعلان يجب أن يذكر بدقة: المساحة الإجمالية إن توفّرت، والمساحة الصافية، وعدد الغرف، وعدد الصالات، والطابق، وعمر البناء، واتجاه الواجهة، وعدد طوابق العمارة، والسعر مع العملة. أو الغرف المخالفة تُعد تضليلاً.",
      },
      {
        heading: "5. الصور والفيديوهات",
        body: "يجب أن تكون الصور حقيقية ومن العقار نفسه. ويُمنع استخدام صور من مواقع أخرى أو صور أُنتجت بالذكاء الاصطناعي، أو ترتيب صور تجعل العقار يبدو أكبر أو أفضل من حقيقته. ونحق لنا طلب معاينة أو فيديو للعقار.",
      },
      {
        heading: "6. ما لا يُنشر",
        body: "نرفض نشر أسعار أو وعود مضلّلة مثل «الأرخص» أو «مضمون» أو «بدون عمولة» إن لم تكن صحيحة، ونرفض المحتوى المسيء أو التمييزي، والإعلانات عن عقارات خارج تركيا، وأي محتوى يخالف الأنظمة التركية.",
      },
      {
        heading: "7. التوافر والشروط",
        body: "اذكر متى العقار متاح للبيع أو للإيجار، وهل السعر قابل للتفاوض. وإذا كان السعر «للسوم» فيجب ذكر ذلك صراحة. والإعلان لا يصبح عرضاً ملزماً ما لم تحدّد الشروط بشكل منفصل.",
      },
      {
        heading: "8. المالك أو الوسيط",
        body: "إن كنت لا تملك العقار وتعرضه بالوكالة، فيجب أن يوضح الإعلان ذلك صراحة، وأن يكون لديك سجل تجاري وترخيص ساري. ولا يجوز الإعلان عن العقار باسم مالكه.",
      },
      {
        heading: "9. حقنا في الرفض",
        body: "نراجع كل إعلان قبل نشره، ولنا الحق في رفضه أو تعديله أو حذفه. والإعلانات المكرّرة، أو التي لا تُظهر صوراً حقيقية، أو التي تبقى منشورة بعد انتهاء صلاحيتها، تُنزع تلقائياً. ومن يستخدم الموقع لنشر مواد مخالفة قد يُوقف حسابه نهائياً.",
      },
      {
        heading: "10. لماذا نطلب هذه البيانات",
        body: "نجمع هذه البيانات لأداء التزاماتنا القانونية تجاه المشترين والمزودين والجهات الرقابية، ولحماية المشترين من الإعلانات المضلّلة. وما نحتفظ به ومدة الاحتفاظ موضحة في سياسة الخصوصية.",
      },
    ],
  },
  en: {
    title: "Property Listing Rules",
    intro:
      "These rules are binding on everyone who advertises a property on Iskan Real Estate. Advertising property in Turkey is regulated, and everything below reflects what we check before publishing.",
    date: "Last updated: October 2026",
    sections: [
      {
        heading: "1. Proof of authority",
        body: "You confirm that you own the property, or that you hold a power of attorney from the owner allowing you to advertise it. If we ask for documents — a title deed, a power of attorney, or proof of inheritance — you must provide them, otherwise we suspend the listing. Under Article 706 of the Turkish Civil Code, a specific power of attorney is required for the transfer of a property.",
      },
      {
        heading: "2. Declare the title status accurately",
        body: "You must accurately declare the status of the title deed and the owner's citizenship. A false declaration exposes you to legal liability and the listing will be removed.",
      },
      {
        heading: "3. Electronic listing verification (EİDS)",
        body: "Since 15 February 2026 the Electronic Listing Verification System (EİDS) has been mandatory for all property advertising in Turkey, including property offered for sale. We ask for the owner's full name and phone number so the check can be carried out, and the owner must grant publishing permission for a period of at least three months.",
      },
      {
        heading: "4. Information every listing must carry",
        body: "Every listing must state, accurately: gross area where available, net area, number of rooms, number of living rooms, floor, building age, façade direction, number of floors in the building, and the price with its currency. A wrong area or room count is treated as misleading.",
      },
      {
        heading: "5. Images and videos",
        body: "Images must be genuine and show the property itself. Stock photos from other sites, AI-generated visuals, and layouts that make a property look larger or better than it is, are not permitted. We may ask for a viewing or a video of the property.",
      },
      {
        heading: "6. What will not be published",
        body: "We do not publish: misleading claims such as “cheapest”, “guaranteed” or “no commission” unless they are true; sales or rentals split across the individual pages we list; abusive or discriminatory content; property outside Turkey; or anything that breaches Turkish regulation.",
      },
      {
        heading: "7. Availability and terms",
        body: "State when the property is available and whether the price is negotiable. A price “to be agreed” must be declared as such. A listing does not become a binding offer until the terms are set out separately.",
      },
      {
        heading: "8. Owner or agent",
        body: "If you do not own the property and advertise it on someone's behalf, the listing must say so plainly, and you must hold a valid commercial licence. You may not advertise a property in the owner's name.",
      },
      {
        heading: "9. Our right to decline",
        body: "We review every listing before publication and may decline, amend or remove it. Duplicate listings, listings with no genuine photos, and listings left live after they have expired are removed automatically. Anyone using the site to publish unlawful material may have their account permanently suspended.",
      },
      {
        heading: "10. Why we ask for this",
        body: "We collect this information to meet our legal obligations towards buyers, suppliers and regulators, and to protect buyers from misleading advertising. What we hold and how long we keep it is set out in the Privacy Policy.",
      },
    ],
  },
}