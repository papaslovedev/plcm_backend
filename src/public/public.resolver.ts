import { Args, Field, InputType, Mutation, ObjectType, Resolver } from '@nestjs/graphql';
import { PrismaService } from '../prisma/prisma.module';
import { Resend } from 'resend';
@InputType() class ContactInput { @Field() name!: string; @Field() email!: string; @Field({nullable:true}) phone?: string; @Field({nullable:true}) subject?: string; @Field() message!: string; }
@InputType() class SponsorInput { @Field() name!: string; @Field() email!: string; @Field({nullable:true}) phone?: string; @Field({nullable:true}) country?: string; @Field({nullable:true}) amount?: string; @Field({nullable:true}) frequency?: string; @Field({nullable:true}) message?: string; }
@ObjectType() class PublicResult { @Field() success!: boolean; }
@Resolver()
export class PublicResolver {
 constructor(private db:PrismaService) {}
 @Mutation(() => PublicResult) async submitContact(@Args('input') input:ContactInput) { await this.db.contactMessage.create({data:input}); return {success:true}; }
 @Mutation(() => PublicResult) async submitSponsorInquiry(@Args('input') input:SponsorInput) { await this.db.sponsorInquiry.create({data:input}); return {success:true}; }
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
