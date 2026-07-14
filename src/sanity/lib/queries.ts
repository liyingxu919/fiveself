export const PRODUCTS_QUERY = `*[_type == "product"] | order(order asc) {
  _id, name, nameCn, category, description, price, features,
  checkoutUrl,
  "image": image.asset->url, "slug": slug.current
}`;

export const TESTIMONIALS_QUERY = `*[_type == "testimonial"] | order(order asc) {
  _id, quote, name, location, "avatar": avatar.asset->url
}`;

export const HOME_PAGE_QUERY = `*[_type == "homePage"][0]{
  hero, mission, howItWorks, sample, faq, bestSellers, testimonialsSec, benefits
}`;

export const ABOUT_PAGE_QUERY = `*[_type == "aboutPage"][0]{
  headline1En, headline1Zh,
  headline2En, headline2Zh,
  headline3En, headline3Zh,
  values, ctaHeadingEn, ctaHeadingZh
}`;

export const SITE_SETTINGS_QUERY = `*[_type == "siteSettings"][0]{
  brandNameEn, brandNameZh,
  footerDescEn, footerDescZh,
  disclaimerEn, disclaimerZh,
  contactEmail, instagramUrl, pinterestUrl
}`;
