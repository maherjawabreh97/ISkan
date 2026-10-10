import type { Locale } from "../i18n"

export interface AdminDict {
  brand: string
  login: {
    title: string
    subtitle: string
    username: string
    password: string
    submit: string
    error: string
    rateLimit: string
    hint: string
  }
  nav: {
    dashboard: string
    properties: string
    users: string
    viewSite: string
    signOut: string
  }
  roles: Record<"admin" | "editor" | "viewer", string>
  common: {
    save: string
    saving: string
    cancel: string
    back: string
    edit: string
    delete: string
    create: string
    actions: string
    confirmDelete: string
    optional: string
    none: string
    status: string
    role: string
    username: string
    name: string
    password: string
    newPassword: string
    leaveBlank: string
    createdAt: string
    signedInAs: string
  }
  dashboard: {
    title: string
    subtitle: string
    totalProperties: string
    forSale: string
    forRent: string
    totalUsers: string
    recent: string
    empty: string
    addProperty: string
    manageProperties: string
    manageUsers: string
    welcome: string
  }
  properties: {
    title: string
    subtitle: string
    add: string
    edit: string
    empty: string
    emptyDesc: string
    image: string
    property: string
    purpose: string
    price: string
    city: string
    featured: string
    yes: string
    no: string
    deleted: string
    saved: string
    citizenship: string
  }
  form: {
    basicSection: string
    pricingSection: string
    detailsSection: string
    mediaSection: string
    contentSection: string
    amenitiesSection: string
    purpose: string
    propertyType: string
    city: string
    price: string
    currency: string
    pricePerMonth: string
    bedrooms: string
    bathrooms: string
    area: string
    netArea: string
    parking: string
    yearBuilt: string
    floor: string
    citizenshipEligible: string
    citizenshipHint: string
    featured: string
    nameAr: string
    nameEn: string
    addressAr: string
    addressEn: string
    descriptionAr: string
    descriptionEn: string
    requirementsAr: string
    requirementsEn: string
    floorLabelAr: string
    floorLabelEn: string
    amenities: string
    existingImages: string
    uploadImages: string
    removeImage: string
    imagesHelp: string
    noImages: string
  }
  users: {
    title: string
    subtitle: string
    add: string
    edit: string
    empty: string
    lastAdminError: string
    selfError: string
    passwordHint: string
    saved: string
    deleted: string
  }
  errors: {
    forbidden: string
    notFound: string
  }
}

const ar: AdminDict = {
  brand: "لوحة التحكم",
  login: {
    title: "تسجيل دخول المسؤول",
    subtitle: "أدخل بياناتك للوصول إلى لوحة التحكم",
    username: "اسم المستخدم",
    password: "كلمة السر",
    submit: "دخول",
    error: "اسم المستخدم أو كلمة السر غير صحيحة.",
    rateLimit:
      "محاولات دخول كثيرة خاطئة. الرجاء المحاولة بعد بضع دقائق.",
    hint: "الحساب الافتراضي: admin / admin123 (غيّره من صفحة المستخدمين)",
  },
  nav: {
    dashboard: "نظرة عامة",
    properties: "العقارات",
    users: "المستخدمون",
    viewSite: "عرض الموقع",
    signOut: "خروج",
  },
  roles: {
    admin: "مسؤول",
    editor: "محرّر",
    viewer: "مشاهد",
  },
  common: {
    save: "حفظ",
    saving: "جارٍ الحفظ…",
    cancel: "إلغاء",
    back: "رجوع",
    edit: "تعديل",
    delete: "حذف",
    create: "إضافة",
    actions: "إجراءات",
    confirmDelete: "هل أنت متأكد من الحذف؟ لا يمكن التراجع.",
    optional: "اختياري",
    none: "—",
    status: "الحالة",
    role: "الدور",
    username: "اسم المستخدم",
    name: "الاسم",
    password: "كلمة السر",
    newPassword: "كلمة سر جديدة",
    leaveBlank: "اتركه فارغاً للإبقاء على كلمة السر الحالية",
    createdAt: "تاريخ الإنشاء",
    signedInAs: "مسجّل الدخول باسم",
  },
  dashboard: {
    title: "نظرة عامة",
    subtitle: "ملخص سريع لموقع إسكان",
    totalProperties: "إجمالي العقارات",
    forSale: "للبيع",
    forRent: "للإيجار",
    totalUsers: "المستخدمون",
    recent: "أحدث العقارات",
    empty: "لا توجد عقارات بعد.",
    addProperty: "إضافة عقار",
    manageProperties: "إدارة العقارات",
    manageUsers: "إدارة المستخدمين",
    welcome: "أهلاً بك",
  },
  properties: {
    title: "العقارات",
    subtitle: "أضف وعدّل واستعرض كل الإعلانات",
    add: "إعلان جديد",
    edit: "تعديل العقار",
    empty: "لا توجد عقارات",
    emptyDesc: "ابدأ بإضافة أول إعلان من الزر أعلاه.",
    image: "الصورة",
    property: "العقار",
    purpose: "الغرض",
    price: "السعر",
    city: "المدينة",
    featured: "مميّز",
    yes: "نعم",
    no: "لا",
    deleted: "تم حذف العقار.",
    saved: "تم حفظ العقار.",
    citizenship: "الجنسية",
  },
  form: {
    basicSection: "المعلومات الأساسية",
    pricingSection: "السعر والإيجار",
    detailsSection: "التفاصيل",
    mediaSection: "الصور",
    contentSection: "المحتوى",
    amenitiesSection: "الخدمات",
    purpose: "الغرض",
    propertyType: "نوع العقار",
    city: "المدينة",
    price: "السعر",
    currency: "العملة",
    pricePerMonth: "إيجار شهري",
    bedrooms: "عدد الغرف",
    bathrooms: "عدد الحمّامات",
    area: "المساحة الإجمالية (م²)",
    netArea: "المساحة الصافية (م²)",
    parking: "مواقف السيارات",
    yearBuilt: "سنة البناء",
    floor: "الطابق",
    citizenshipEligible: "مناسب للجنسية",
    citizenshipHint: "يُستخدم عادةً لعقارات البيع فقط.",
    featured: "عقار مميّز",
    nameAr: "الاسم (عربي)",
    nameEn: "الاسم (إنجليزي)",
    addressAr: "العنوان (عربي)",
    addressEn: "العنوان (إنجليزي)",
    descriptionAr: "الوصف (عربي)",
    descriptionEn: "الوصف (إنجليزي)",
    requirementsAr: "المتطلبات (عربي)",
    requirementsEn: "المتطلبات (إنجليزي)",
    floorLabelAr: "وصف الطابق (عربي)",
    floorLabelEn: "وصف الطابق (إنجليزي)",
    amenities: "الخدمات المتوفرة",
    existingImages: "الصور الحالية",
    uploadImages: "رفع صور الغرف",
    removeImage: "حذف هذه الصورة",
    imagesHelp: "يمكنك اختيار عدة صور (JPG، PNG، WEBP). الحد 8 ميغابايت للصورة.",
    noImages: "لا توجد صور بعد.",
  },
  users: {
    title: "المستخدمون والأدوار",
    subtitle: "أضف المستخدمين وحدّد صلاحياتهم",
    add: "مستخدم جديد",
    edit: "تعديل المستخدم",
    empty: "لا يوجد مستخدمون.",
    lastAdminError: "لا يمكن حذف آخر مسؤول.",
    selfError: "لا يمكنك حذف حسابك الحالي.",
    passwordHint: "6 أحرف على الأقل.",
    saved: "تم حفظ المستخدم.",
    deleted: "تم حذف المستخدم.",
  },
  errors: {
    forbidden: "ليس لديك صلاحية للوصول إلى هذه الصفحة.",
    notFound: "العنصر غير موجود.",
  },
}

const en: AdminDict = {
  brand: "Dashboard",
  login: {
    title: "Admin sign in",
    subtitle: "Enter your credentials to access the dashboard",
    username: "Username",
    password: "Password",
    submit: "Sign in",
    error: "Invalid username or password.",
    rateLimit:
      "Too many failed sign-in attempts. Please try again in a few minutes.",
    hint: "Default account: admin / admin123 (change it in the Users page)",
  },
  nav: {
    dashboard: "Overview",
    properties: "Properties",
    users: "Users",
    viewSite: "View site",
    signOut: "Sign out",
  },
  roles: {
    admin: "Admin",
    editor: "Editor",
    viewer: "Viewer",
  },
  common: {
    save: "Save",
    saving: "Saving…",
    cancel: "Cancel",
    back: "Back",
    edit: "Edit",
    delete: "Delete",
    create: "Add",
    actions: "Actions",
    confirmDelete: "Are you sure? This cannot be undone.",
    optional: "optional",
    none: "—",
    status: "Status",
    role: "Role",
    username: "Username",
    name: "Name",
    password: "Password",
    newPassword: "New password",
    leaveBlank: "Leave blank to keep the current password",
    createdAt: "Created",
    signedInAs: "Signed in as",
  },
  dashboard: {
    title: "Overview",
    subtitle: "A quick summary of Iskan",
    totalProperties: "Total properties",
    forSale: "For sale",
    forRent: "For rent",
    totalUsers: "Users",
    recent: "Latest properties",
    empty: "No properties yet.",
    addProperty: "Add property",
    manageProperties: "Manage properties",
    manageUsers: "Manage users",
    welcome: "Welcome",
  },
  properties: {
    title: "Properties",
    subtitle: "Add, edit and browse all listings",
    add: "New listing",
    edit: "Edit property",
    empty: "No properties",
    emptyDesc: "Start by adding your first listing above.",
    image: "Image",
    property: "Property",
    purpose: "Purpose",
    price: "Price",
    city: "District",
    featured: "Featured",
    yes: "Yes",
    no: "No",
    deleted: "Property deleted.",
    saved: "Property saved.",
    citizenship: "Citizenship",
  },
  form: {
    basicSection: "Basic information",
    pricingSection: "Price & rent",
    detailsSection: "Details",
    mediaSection: "Images",
    contentSection: "Content",
    amenitiesSection: "Amenities",
    purpose: "Purpose",
    propertyType: "Property type",
    city: "District",
    price: "Price",
    currency: "Currency",
    pricePerMonth: "Monthly rent",
    bedrooms: "Bedrooms",
    bathrooms: "Bathrooms",
    area: "Total area (m²)",
    netArea: "Net area (m²)",
    parking: "Parking",
    yearBuilt: "Year built",
    floor: "Floor",
    citizenshipEligible: "Citizenship eligible",
    citizenshipHint: "Usually relevant for sale properties only.",
    featured: "Featured property",
    nameAr: "Name (Arabic)",
    nameEn: "Name (English)",
    addressAr: "Address (Arabic)",
    addressEn: "Address (English)",
    descriptionAr: "Description (Arabic)",
    descriptionEn: "Description (English)",
    requirementsAr: "Requirements (Arabic)",
    requirementsEn: "Requirements (English)",
    floorLabelAr: "Floor label (Arabic)",
    floorLabelEn: "Floor label (English)",
    amenities: "Amenities",
    existingImages: "Current images",
    uploadImages: "Upload room images",
    removeImage: "Remove this image",
    imagesHelp: "You can select multiple images (JPG, PNG, WEBP). Max 8 MB each.",
    noImages: "No images yet.",
  },
  users: {
    title: "Users & roles",
    subtitle: "Add users and set their permissions",
    add: "New user",
    edit: "Edit user",
    empty: "No users.",
    lastAdminError: "You cannot delete the last admin.",
    selfError: "You cannot delete your own account.",
    passwordHint: "At least 6 characters.",
    saved: "User saved.",
    deleted: "User deleted.",
  },
  errors: {
    forbidden: "You do not have permission to access this page.",
    notFound: "Item not found.",
  },
}

export const adminDictionaries: Record<Locale, AdminDict> = { ar, en }

export const getAdminDict = (locale: Locale): AdminDict =>
  adminDictionaries[locale]
