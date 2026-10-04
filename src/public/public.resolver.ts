import { Args, Field, InputType, Mutation, ObjectType, Resolver } from '@nestjs/graphql';
import { PrismaService } from '../prisma/prisma.module';
import { Resend } from 'resend';
@InputType() class ContactInput { @Field() name!: string; @Field() email!: string; @Field({nullable:true}) phone?: string; @Field({nullable:true}) subject?: string; @Field({nullable:true}) country?: string; @Field() message!: string; }
@InputType() class SponsorInput { @Field() name!: string; @Field() email!: string; @Field({nullable:true}) phone?: string; @Field({nullable:true}) country?: string; @Field({nullable:true}) amount?: string; @Field({nullable:true}) frequency?: string; @Field({nullable:true}) message?: string; }
@ObjectType() class PublicResult { @Field() success!: boolean; }
@Resolver()
export class PublicResolver {
 constructor(private db:PrismaService) {}
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
