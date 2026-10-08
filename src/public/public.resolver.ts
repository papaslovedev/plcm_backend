import { Args, Field, InputType, Mutation, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { PrismaService } from '../prisma/prisma.module';
import { Resend } from 'resend';
@InputType() class ContactInput { @Field() name!: string; @Field() email!: string; @Field({nullable:true}) phone?: string; @Field({nullable:true}) subject?: string; @Field({nullable:true}) country?: string; @Field() message!: string; }
@InputType() class SponsorInput { @Field() name!: string; @Field() email!: string; @Field({nullable:true}) phone?: string; @Field({nullable:true}) country?: string; @Field({nullable:true}) amount?: string; @Field({nullable:true}) frequency?: string; @Field({nullable:true}) message?: string; }
@ObjectType() class PublicSiteSettings { @Field() ministryName!: string; @Field() campaignManagerName!: string; @Field() campaignLink!: string; @Field() email!: string; @Field() phone!: string; @Field() alternatePhone!: string; @Field() location!: string; @Field() whatsapp!: string; @Field() instagram!: string; @Field() facebook!: string; @Field() tiktok!: string; @Field() youtube!: string; @Field() threads!: string; @Field() mtnNumber!: string; @Field() mtnAccountName!: string; @Field() airtelNumber!: string; @Field() airtelAccountName!: string; @Field() equityBankName!: string; @Field() equityAccountName!: string; @Field() equityAccountNumber!: string; @Field() equitySwiftCode!: string; @Field() equityBranchName!: string; @Field() westernUnionReceiverName!: string; @Field() westernUnionCountry!: string; @Field() westernUnionCity!: string; @Field() westernUnionTelephone!: string; @Field() remitlyRecipientName!: string; @Field() remitlyCountry!: string; @Field() remitlyCity!: string; @Field() remitlyTelephone!: string; }
@ObjectType() class NewsPostItem { @Field() id!: string; @Field() category!: string; @Field() title!: string; @Field() excerpt!: string; @Field() image!: string; @Field() tag!: string; @Field() featured!: boolean; @Field() createdAt!: Date; }
@ObjectType() class GalleryPostItem { @Field() id!:string; @Field() src!:string; @Field() title!:string; @Field() caption!:string; @Field() category!:string; @Field() position!:number; }
@ObjectType() class PublicResult { @Field() success!: boolean; }
@Resolver()
export class PublicResolver {
 constructor(private db:PrismaService) {}
 @Query(() => [GalleryPostItem]) async publicGallery() { if (!(await this.db.galleryPost.count())) await this.db.galleryPost.createMany({data:[{"src":"/images/papas-carousel-children.png","title":"A place to belong","caption":"Every child deserves to be welcomed, known and loved.","category":"Children","position":0},{"src":"/images/t3.jpeg","title":"Little moments, big hope","caption":"The smiles and everyday moments that make this family.","category":"Children","position":1},{"src":"/images/papas-love-about-us.png","title":"Growing together","caption":"Care, encouragement and the promise of a brighter tomorrow.","category":"Our Home","position":2},{"src":"/images/papas-carousel-food.png","title":"Love served daily","caption":"Nutritious food is one of the ways love becomes practical.","category":"Daily Care","position":3},{"src":"/images/food.jpg","title":"Nourishment matters","caption":"Helping children grow with strength, energy and dignity.","category":"Daily Care","position":4},{"src":"/images/school.jpeg","title":"Room to learn and dream","caption":"Education opens doors to possibility.","category":"Learning","position":5},{"src":"/images/papas-carousel-school-supplies.png","title":"Tools for tomorrow","caption":"Books and school supplies help turn curiosity into confidence.","category":"Learning","position":6},{"src":"/images/water.jpg","title":"The essentials of care","caption":"Safe water and everyday necessities help protect wellbeing.","category":"Daily Care","position":7},{"src":"/images/shelter.jpg","title":"A safe place to rest","caption":"A caring home where children can feel protected and at peace.","category":"Our Home","position":8}]}); return this.db.galleryPost.findMany({orderBy:[{position:'asc'},{createdAt:'asc'}]}); }
 @Query(() => [NewsPostItem]) async publicNews() { const count=await this.db.newsPost.count(); if(!count) await this.db.newsPost.createMany({data:[{"category":"Daily Care","title":"A place where every child belongs","excerpt":"At Papa’s Love, care is more than a meal or a bed. It is the everyday promise that each child is seen, welcomed and encouraged to dream.","image":"/images/papas-love-about-us.png","tag":"Our Home","featured":true,"published":true},{"category":"Nutrition","title":"Nourishing little bodies, growing big dreams","excerpt":"Nutritious meals help children feel stronger, focus in class and enjoy the simple joy of growing up. Help us keep dependable meals on the table for the 65 children in our care.","image":"/images/papas-carousel-food.png","tag":"Daily Care","featured":false,"published":true},{"category":"Education","title":"Every school day opens a new door","excerpt":"Books, school supplies, encouragement and consistent support help children take confident steps toward a brighter future.","image":"/images/papas-carousel-school-supplies.png","tag":"Learning","featured":false,"published":true},{"category":"Community","title":"A safe home. A stronger tomorrow.","excerpt":"A stable, caring environment gives vulnerable children room to heal, build friendships and discover their gifts.","image":"/images/shelter.jpg","tag":"Protection","featured":false,"published":true},{"category":"Children","title":"Small moments. Lasting hope.","excerpt":"From shared laughter to learning together, everyday moments remind us why every child deserves dignity, attention and opportunity.","image":"/images/papas-carousel-children.png","tag":"Together","featured":false,"published":true},{"category":"Wellbeing","title":"Care that reaches beyond today","excerpt":"Supporting children means caring for their wellbeing today while helping them build the confidence and skills they will carry into tomorrow.","image":"/images/t3.jpeg","tag":"Our Mission","featured":false,"published":true}]}); return this.db.newsPost.findMany({where:{published:true},orderBy:[{featured:'desc'},{createdAt:'desc'}]}); }
 @Query(() => PublicSiteSettings) async publicSiteSettings() { return this.db.siteSettings.upsert({where:{id:'main'},create:{id:'main'},update:{}}); }
 @Mutation(() => PublicResult) async submitContact(@Args('input') input:ContactInput) {
  const saved = await this.db.contactMessage.create({data:input});
  const key = process.env.RESEND_API_KEY; const from = process.env.RESEND_FROM_EMAIL;
  if (key && from) {
   const resend = new Resend(key); const esc = (v:string) => v.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
   const details = `<p><b>Name:</b> ${esc(input.name)}</p><p><b>Email:</b> ${esc(input.email)}</p><p><b>Phone:</b> ${esc(input.phone || 'Not provided')}</p><p><b>Country:</b> ${esc(input.country || 'Not provided')}</p><p><b>Topic:</b> ${esc(input.subject || 'General enquiry')}</p><p><b>Message:</b><br/>${esc(input.message).replace(/\\n/g,'<br/>')}</p>`;
   const results = await Promise.allSettled([
    resend.emails.send({from,to:input.email,subject:'We received your message — Papa’s Love Children Ministry',html:`<h2>Thank you for reaching out, ${esc(input.name)}.</h2><p>We have received your message and our team will be in touch as soon as possible.</p><hr/>${details}<p>With gratitude,<br/>Papa’s Love Children Ministry</p>`}),
    resend.emails.send({from,to:'papaslovechildrenministry@gmail.com',replyTo:input.email,subject:`New website contact: ${input.subject || 'General enquiry'}`,html:`<h2>New Contact Us submission</h2><p>Submission ID: ${saved.id}</p>${details}`})
   ]);
   if(results.some(x=>x.status==='rejected'||(x.status==='fulfilled'&&x.value.error))) console.error('Contact email delivery reported a failure.');
  } else console.error('Set RESEND_API_KEY and RESEND_FROM_EMAIL to enable contact emails.');
  return {success:true};
 }
 @Mutation(() => PublicResult) async submitSponsorInquiry(@Args('input') input:SponsorInput) {
  const saved = await this.db.sponsorInquiry.create({data:input});
  const key=process.env.RESEND_API_KEY; const from=process.env.RESEND_FROM_EMAIL;
  if(key&&from){
   const resend=new Resend(key); const esc=(v:string)=>v.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
   const details=`<p><b>Name:</b> ${esc(input.name)}</p><p><b>Email:</b> ${esc(input.email||'Not provided')}</p><p><b>Phone:</b> ${esc(input.phone||'Not provided')}</p><p><b>Country:</b> ${esc(input.country||'Not provided')}</p><p><b>Interest:</b> ${esc(input.amount||'Not specified')} · ${esc(input.frequency||'Not specified')}</p><p><b>Message:</b><br/>${esc(input.message||'No additional message').replace(/\n/g,'<br/>')}</p>`;
   const jobs=[resend.emails.send({from,to:'papaslovechildrenministry@gmail.com',replyTo:input.email||undefined,subject:'New child sponsorship inquiry',html:`<h2>New Sponsor a Child application</h2><p>Submission ID: ${saved.id}</p>${details}`})];
   if(input.email) jobs.push(resend.emails.send({from,to:input.email,subject:'We received your sponsorship enquiry',html:`<h2>Thank you, ${esc(input.name)}.</h2><p>We have received your interest in sponsoring a child. Our team will contact you to explain the options and answer your questions.</p>${details}<p>With gratitude,<br/>Papa’s Love Children Ministry</p>`}));
   const outcomes=await Promise.allSettled(jobs);
   if(outcomes.some(x=>x.status==='rejected'||(x.status==='fulfilled'&&x.value.error))) console.error('Sponsor email delivery reported a failure.');
  } else console.error('Set RESEND_API_KEY and RESEND_FROM_EMAIL to enable sponsor emails.');
  return {success:true};
 }
 @Mutation(() => PublicResult) async subscribeNewsletter(@Args('email') email:string) {
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) throw new Error('Please provide a valid email address.');
  const existing = await this.db.newsletterSubscriber.findUnique({ where: { email: normalized } });
  if (existing) return { success: true };
  await this.db.newsletterSubscriber.create({ data: { email: normalized } });
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const staff = process.env.NEWSLETTER_STAFF_EMAIL || 'papaslovechildrenministry@gmail.com';
  if (!key || !from) { console.error('Set RESEND_API_KEY and RESEND_FROM_EMAIL to enable newsletter emails.'); return { success: true }; }
  const resend = new Resend(key);
  const outcomes = await Promise.allSettled([
    resend.emails.send({ from, to: normalized, subject: 'Thank you for subscribing', html: '<h2>Thank you for joining Papa’s Love Children Ministry!</h2><p>Your newsletter subscription has been received. We look forward to sharing ministry news, stories and ways to support children in Naama, Uganda.</p><p>With gratitude,<br/>Papa’s Love Children Ministry</p>' }),
    resend.emails.send({ from, to: staff, subject: 'New newsletter subscription', html: '<h2>New newsletter subscriber</h2><p>A visitor subscribed to the newsletter:</p><p>' + normalized.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</p>' }),
  ]);
  if (outcomes.some(x => x.status === 'rejected' || (x.status === 'fulfilled' && x.value.error))) console.error('Newsletter email delivery reported a failure.');
  return { success: true };
}
}
