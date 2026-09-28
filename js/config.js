export const siteConfig = {
  brand: 'AD HUB',
  tagline: 'AI-Powered Advertising. Professionally Crafted.',
  description: 'Professional cinematic video advertisements for businesses and brands, created with AI-powered production, storytelling, voice over and motion graphics.',
  contact: {
    name: 'Mr. Ali Husnain',
    role: 'CEO',
    phoneDisplay: '03486421476',
    phoneInternational: '923486421476',
    location: 'Sahiwal, Punjab, Pakistan',
    whatsappMessage: 'Assalam-o-Alaikum, I would like to know more about Ad Hub video advertising services.'
  },
  social: { facebook: '', instagram: '', tiktok: '', youtube: '' },
  supabase: {
    url: 'https://xoebntswamiakwrazlxj.supabase.co',
    anonKey: 'sb_publishable_Wembg18t8spUwBNGlLe5aQ_YoA5FFCk',
    videoBucket: 'portfolio-videos',
    thumbnailBucket: 'portfolio-thumbnails'
  }
};
export const services = [
  ['AI Video Advertisements','AI-assisted creative production shaped for your campaign goals.'],
  ['Cinematic Business Ads','Polished visual direction that makes businesses feel credible and premium.'],
  ['AI Model Video Ads','Flexible model-led concepts created for product and service campaigns.'],
  ['Product Promotions','Focused product storytelling designed for attention and clarity.'],
  ['Social Media Video Ads','Fast, platform-ready creative built for mobile-first audiences.'],
  ['Brand Promotional Videos','Consistent brand stories with professional pacing and finish.'],
  ['Creative Storytelling','Concept-led narratives that turn an offer into a memorable story.'],
  ['Professional Voice Over','Clear, campaign-appropriate narration integrated into each edit.'],
  ['Motion Graphics','Elegant titles, callouts and animated brand elements.']
];
export const packages = [
  {duration:'1 Minute',price:'Rs. 1,500',features:['AI-powered creative production','Professional editing','Voice over & motion graphics','24 Hours Guaranteed Delivery']},
  {duration:'1 Minute 30 Seconds',price:'Rs. 2,000',features:['Extended campaign format','Professional editing','Voice over & motion graphics','24 Hours Guaranteed Delivery']},
  {duration:'2 Minutes',price:'Rs. 2,500',features:['Detailed product or service story','Professional editing','Voice over & motion graphics','24 Hours Guaranteed Delivery'],featured:true},
  {duration:'3 Minutes',price:'Rs. 4,000',features:['Long-form promotional format','Professional editing','Voice over & motion graphics','24 Hours Guaranteed Delivery']}
];
export const fallbackCategories = ['Real Estate','Restaurants','Skincare / Beauty','Jewelry','Fashion','Clinics','Products','Corporate / Business','Other'];
export const fallbackVideos = [
  {id:'demo-1',title:'Real Estate Video Placeholder',category:'Real Estate',description:'Replace this demo entry with an actual Ad Hub project.',thumbnail_url:'./assets/poster.svg',video_url:'',featured:true,is_demo:true},
  {id:'demo-2',title:'Restaurant Video Placeholder',category:'Restaurants',description:'Replace this demo entry with an actual Ad Hub project.',thumbnail_url:'./assets/poster.svg',video_url:'',featured:true,is_demo:true},
  {id:'demo-3',title:'Beauty Video Placeholder',category:'Skincare / Beauty',description:'Replace this demo entry with an actual Ad Hub project.',thumbnail_url:'./assets/poster.svg',video_url:'',featured:true,is_demo:true},
  {id:'demo-4',title:'Jewelry Video Placeholder',category:'Jewelry',description:'Replace this demo entry with an actual Ad Hub project.',thumbnail_url:'./assets/poster.svg',video_url:'',featured:true,is_demo:true},
  {id:'demo-5',title:'Product Video Placeholder',category:'Products',description:'Replace this demo entry with an actual Ad Hub project.',thumbnail_url:'./assets/poster.svg',video_url:'',featured:true,is_demo:true},
  {id:'demo-6',title:'Business Video Placeholder',category:'Corporate / Business',description:'Replace this demo entry with an actual Ad Hub project.',thumbnail_url:'./assets/poster.svg',video_url:'',featured:true,is_demo:true}
];
export const testimonials = [
  {name:'Client name',business:'Business name',text:'Add a verified client review here.',rating:5,demo:true},
  {name:'Client name',business:'Business name',text:'Replace this sample with genuine feedback after client approval.',rating:5,demo:true},
  {name:'Client name',business:'Business name',text:'This testimonial is an editable placeholder.',rating:5,demo:true}
];
