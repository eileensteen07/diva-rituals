import type { Product } from "./catalog-data";

type ProductCopy = Pick<Product, "name" | "subtitle" | "description" | "use">;

export const productRu: Record<string, ProductCopy> = {
  "cloud-cleanse": { name: "Madagascar Centella Foam", subtitle: "Пенка для умывания с экстрактом центеллы", description: "Мягко очищает кожу и оставляет ощущение свежести без стянутости.", use: "Нанесите на влажную кожу, вспеньте и смойте водой." },
  "enzyme-polish": { name: "MICRO TEA POWDER CLEANSER", subtitle: "Энзимная пудра с чайным деревом, 70 мл", description: "Мягко очищает, выравнивает текстуру и освежает кожу.", use: "Смешайте с водой, вспеньте в ладонях и нанесите на влажную кожу на 30–60 секунд." },
  "rose-toner": { name: "VEGAN KOMBUCHA TEA ESSENCE", subtitle: "Кремовая эссенция с комбучей и чёрным чаем, 150 мл", description: "Увлажняет, смягчает и возвращает коже естественное сияние.", use: "Встряхните флакон и нанесите после очищения перед сывороткой или кремом." },
  "peptide-dew": { name: "BAKUCHIOL PEPTIDES", subtitle: "Пептидная сыворотка с бакучиолом, 30 мл", description: "Помогает сделать кожу более гладкой, упругой и ухоженной без ощущения тяжести.", use: "Нанесите 2–3 капли утром или вечером перед кремом." },
  "vitamin-c-glow": { name: "Anua Azelaic 10+", subtitle: "Сыворотка с азелаиновой и гиалуроновой кислотами", description: "Успокаивает, увлажняет и помогает выровнять тон кожи.", use: "Нанесите 2–3 капли после очищения, избегая зоны вокруг глаз." },
  "barrier-kiss": { name: "Barrier Kiss", subtitle: "Восстанавливающий крем", description: "Комфортный крем для ежедневной поддержки защитного барьера кожи.", use: "Нанесите небольшое количество на лицо и шею." },
  "daily-spf": { name: "Relief Sun Rice", subtitle: "Солнцезащитный крем SPF50+ с пробиотиками", description: "Лёгкий крем с рисом и пробиотиками для ежедневной защиты кожи.", use: "Наносите каждое утро как последний этап ухода." },
  "aura-glow": { name: "MOISTURE SLEEPING MASK", subtitle: "Ночная увлажняющая маска для лица, 60 мл", description: "Помогает коже выглядеть мягкой, свежей и отдохнувшей утром.", use: "Нанесите тонким слоем как последний этап вечернего ухода." },
  "eye-cloud": { name: "Dr. Althea Cream Mist", subtitle: "Успокаивающий кремовый спрей для лица", description: "Невесомый спрей для быстрого увлажнения и комфорта в течение дня.", use: "Распылите с расстояния 20–30 см или распределите ладонями." },
  "needly-azelaic": { name: "Восстанавливающий крем с азелаиновой кислотой", subtitle: "Needly Azelaic Acid 12 Ceramide Cream, 30 мл", description: "Крем с 12% азелаиновой кислоты и керамидами успокаивает и поддерживает защитный барьер.", use: "Нанесите тонким слоем вечером; утром используйте SPF." },
  "usolab-eye": { name: "Осветляющий крем для зоны вокруг глаз", subtitle: "Usolab Bio Advanced Lightening Eye Cream, 25 мл", description: "Помогает уменьшить видимость усталости, отёков и тусклости.", use: "Нанесите небольшое количество по косточке вокруг глаз, не растирая кожу." },
  "spot-calm": { name: "15% CALAMINE SPOT POWDER", subtitle: "Точечное средство с каламином и кислотами, 15 мл", description: "Локальный уход за воспалениями и покраснениями.", use: "Наносите точечно на чистую сухую кожу, не смывайте." },
  "lip-mask": { name: "LIP SLEEPING MASK", subtitle: "Пробник ночной маски для губ с ягодным экстрактом, 3 мл", description: "Мини-формат маски для мягкости и блеска губ после сна.", use: "Нанесите перед сном или тонким слоем днём." },
  "silk-shower": { name: "Bitter Orange Body Lotion", subtitle: "Лосьон для рук и тела, 450 мл", description: "Парфюмированный лосьон с тёплой цитрусовой нотой для мягкой и гладкой кожи.", use: "Наносите на чистую кожу рук и тела после душа." },
  "pink-souffle": { name: "Fig Whisky Body Oil", subtitle: "Масло для тела, 100 мл", description: "Питательное масло с тёплой нотой инжира и виски для шелковистого финиша.", use: "Распределите несколько капель по влажной или сухой коже." },
  "body-milk": { name: "Shower Time Body Lotion", subtitle: "Лосьон для рук и тела, 450 мл", description: "Лёгкий лосьон со свежим ароматом для ежедневного увлажнения.", use: "Наносите ежедневно после душа." },
  "sugar-veil": { name: "Fig Whisky Body Scrub", subtitle: "Скраб для тела, 240 г", description: "Деликатный скраб для гладкой, мягкой и ароматной кожи.", use: "Массируйте влажную кожу 1–2 раза в неделю." },
  "body-glaze": { name: "Bitter Orange Body Wash", subtitle: "Гель для рук и тела, 450 мл", description: "Ароматный гель с нотой горького апельсина для мягкого очищения.", use: "Нанесите на влажную кожу, вспеньте и смойте." },
  "hand-cream": { name: "Shower Time Body Wash", subtitle: "Средство для мытья рук и тела, 350 мл", description: "Деликатно очищает руки и тело лёгкой свежей пеной.", use: "Нанесите на влажную кожу, вспеньте и тщательно смойте." },
  "body-spf": { name: "Fig Whisky Body Scrub", subtitle: "Скраб для тела, 240 г", description: "Ароматный скраб с деликатными частицами для гладкой и мягкой кожи.", use: "Массируйте влажную кожу 1–2 раза в неделю." },
  "centella-bb": { name: "BB-крем с центеллой", subtitle: "Purito Wonder Releaf Centella BB Cream, 30 мл", description: "Легко выравнивает тон и успокаивает кожу благодаря экстракту центеллы.", use: "Нанесите тонким слоем на увлажнённую кожу." },
  "eclair-powder": { name: "Бежевая финишная пудра", subtitle: "Setting & Finishing Powder Eclair, 10 г", description: "Мелкодисперсная пудра для мягкого матирования и естественного финиша.", use: "Нанесите пуховкой или кистью на Т-зону." },
  "lip-peptide": { name: "Карандаш для губ с пептидами", subtitle: "Lip Pencil with Peptides Diva", description: "Кремовая текстура для точного контура и комфортного цвета губ.", use: "Очертите контур или заполните карандашом всю поверхность губ." },
  "mono-lip": { name: "Многофункциональная помада", subtitle: "Mono Makeup Color, 5 г", description: "Один нежный оттенок для губ, щёк и век в лёгком мономакияже.", use: "Нанесите пальцами и растушуйте края." },
  "cc-adaptive": { name: "CC-крем с адаптивной формулой", subtitle: "CC-Cream with SPF 35, 30 мл", description: "Выравнивает тон, поддерживает защитный барьер и создаёт естественное покрытие.", use: "Распределите небольшое количество по лицу." },
  "thermo-mascara": { name: "Термотушь-сыворотка", subtitle: "Brown Thermo Mascara with Peptides, 10 г", description: "Коричневая тушь с пептидами для естественного объёма и разделения ресниц.", use: "Нанесите от корней до кончиков в один-два слоя." },
  "brow-gel": { name: "Прозрачный гель-скульптор для бровей", subtitle: "Brow Gel Sculpt and Care, 10 г", description: "Надёжно фиксирует форму бровей без белых следов.", use: "Зачешите брови щёточкой в желаемом направлении." },
  "lipss-call-me": { name: "Блеск для губ «Киевстар»", subtitle: "Lipss +380 Call Me Ukrainian, 9 мл", description: "Лимитированный блеск с символикой Украины для зеркального сияния и комфорта.", use: "Нанесите аппликатором самостоятельно или поверх карандаша." },
  "crystallove-contour-brush": { name: "Crystallove Contour Face Brush", subtitle: "Массажный инструмент для лица, шеи и декольте", description: "Контурная щётка для деликатного ежедневного массажа.", use: "Используйте по сухой коже или поверх уходового средства лёгкими движениями." },
  "rose-quartz-gua-sha": { name: "Rose Quartz Gua Sha", subtitle: "Кварцевый скребок для массажа лица", description: "Гладкий скребок из розового кварца для мягкого массажа лица, шеи и декольте.", use: "Используйте с маслом или сывороткой, двигаясь от центра лица к периферии." },
  "face-roller": { name: "Face Roller Massager", subtitle: "Роликовый массажёр для лица", description: "Металлический роллер для тонизирующего ритуала и ощущения свежести.", use: "Двигайтесь вверх по массажным линиям лица и шеи 3–5 минут." },
  "medicube-age-r-booster-pro": { name: "Medicube Age-R Booster Pro Pink", subtitle: "Устройство для домашнего ухода за кожей 6 в 1", description: "Многофункциональное устройство для комплексного домашнего ухода.", use: "Используйте на очищенной коже с подходящим средством по инструкции производителя." },
  "body-pulse-mini": { name: "Body Pulse Mini", subtitle: "Компактный перкуссионный массажёр", description: "Лёгкий массажный пистолет для расслабления мышц после активного дня.", use: "Выберите насадку и комфортную скорость, не задерживаясь на одном участке." },
  "body-pulse-pro": { name: "Body Pulse Pro", subtitle: "Массажный пистолет с 6 насадками", description: "Мощный перкуссионный массажёр с разными режимами для крупных групп мышц.", use: "Используйте на мышцах по инструкции; не применяйте на костях и повреждённых участках." },
  "body-sculpt-cup": { name: "Body Sculpt Cup", subtitle: "Электрический вакуумный массажёр для тела", description: "Вакуумный массажёр с регулируемой интенсивностью для домашнего ухода.", use: "Используйте с массажным маслом и постоянно перемещайте прибор по коже." },
  "anti-puff-body": { name: "4D Lifting Massager", subtitle: "4D-массажёр для лифтинга и моделирования контуров лица и тела", description: "Роликовый массажёр для лифтинг-ритуала и уменьшения ощущения отёчности.", use: "Проводите снизу вверх с лёгким нажимом после душа или поверх масла." },
  "dry-body-brush": { name: "Silk Body Brush", subtitle: "Щётка для сухого массажа тела", description: "Механическая щётка с мягкой щетиной для короткого утреннего ритуала.", use: "Массируйте сухую кожу лёгкими движениями к сердцу 2–3 раза в неделю." },
};

export function localizeProduct(product: Product, locale: "uk" | "ru"): Product {
  const localized = locale === "ru" && productRu[product.id] ? { ...product, ...productRu[product.id] } : { ...product };
  const hasLocalLetters = (value: string) => /[А-Яа-яЁёІіЇїЄєҐґ]/.test(value);

  // Every card uses a localized product type as its primary title. Brand/model
  // names remain in the same, smaller secondary position for every product.
  if (!hasLocalLetters(localized.name) && hasLocalLetters(localized.subtitle)) {
    [localized.name, localized.subtitle] = [localized.subtitle, localized.name];
  }

  if (localized.badge) {
    const badges = locale === "ru"
      ? { "Бестселер": "Бестселлер", "Повторний фаворит": "Снова в избранном", "Must-have": "Рекомендуем" }
      : { "Must-have": "Рекомендуємо" };
    localized.badge = badges[localized.badge as keyof typeof badges] || localized.badge;
  }

  return localized;
}
