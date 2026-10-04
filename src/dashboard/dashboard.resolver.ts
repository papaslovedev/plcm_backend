import { Args, Field, ID, InputType, Int, ObjectType, Query, Resolver, Mutation } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { AdminGuard } from '../auth/admin.guard';

@ObjectType() class ContactItem { @Field(() => ID) id!: string; @Field() name!: string; @Field() email!: string; @Field({ nullable:true }) phone?: string; @Field({ nullable:true }) subject?: string; @Field() message!: string; @Field() status!: string; @Field() createdAt!: Date; }
@ObjectType() class SponsorItem { @Field(() => ID) id!: string; @Field() name!: string; @Field() email!: string; @Field({nullable:true}) phone?: string; @Field({nullable:true}) country?: string; @Field({nullable:true}) amount?: string; @Field({nullable:true}) frequency?: string; @Field({nullable:true}) message?: string; @Field() status!: string; @Field() createdAt!: Date; }
@ObjectType() class SubscriberItem { @Field(() => ID) id!: string; @Field() email!: string; @Field() status!: string; @Field() createdAt!: Date; }
@ObjectType() class SettingsItem { @Field() ministryName!: string; @Field() email!: string; @Field() phone!: string; @Field() alternatePhone!: string; @Field() location!: string; }
@ObjectType() class Overview { @Field(() => Int) contacts!: number; @Field(() => Int) sponsors!: number; @Field(() => Int) subscribers!: number; @Field(() => Int) newContacts!: number; @Field(() => Int) newSponsors!: number; @Field(() => Int) newSubscribers!: number; }
@InputType() class SettingsInput { @Field() ministryName!: string; @Field() email!: string; @Field() phone!: string; @Field() alternatePhone!: string; @Field() location!: string; }
@Resolver()
@UseGuards(AdminGuard)
export class DashboardResolver {
 constructor(private db: PrismaService) {}
 @Query(() => Overview) async adminOverview() { const [contacts,sponsors,subscribers,newContacts,newSponsors,newSubscribers]=await Promise.all([this.db.contactMessage.count(),this.db.sponsorInquiry.count(),this.db.newsletterSubscriber.count(),this.db.contactMessage.count({where:{status:'NEW'}}),this.db.sponsorInquiry.count({where:{status:'NEW'}}),this.db.newsletterSubscriber.count({where:{status:'NEW'}})]); return {contacts,sponsors,subscribers,newContacts,newSponsors,newSubscribers}; }
 @Query(() => [ContactItem]) adminContacts() { return this.db.contactMessage.findMany({orderBy:{createdAt:'desc'}}); }
 @Query(() => [SponsorItem]) adminSponsors() { return this.db.sponsorInquiry.findMany({orderBy:{createdAt:'desc'}}); }
 @Query(() => [SubscriberItem]) adminSubscribers() { return this.db.newsletterSubscriber.findMany({orderBy:{createdAt:'desc'}}); }
 @Mutation(() => SubscriberItem) updateSubscriberStatus(@Args('id') id:string,@Args('status') status:string) { if (!['APPROVED','DECLINED'].includes(status)) throw new Error('Invalid subscriber status'); return this.db.newsletterSubscriber.update({where:{id},data:{status}}); }
 @Query(() => SettingsItem) async adminSettings() { return this.db.siteSettings.upsert({where:{id:'main'},create:{id:'main'},update:{}}); }
 @Mutation(() => ContactItem) updateContactStatus(@Args('id') id:string,@Args('status') status:string) { if (!['HANDLED','IGNORED','NEW'].includes(status)) throw new Error('Invalid contact status'); return this.db.contactMessage.update({where:{id},data:{status}}); }
 @Mutation(() => SponsorItem) updateSponsorStatus(@Args('id') id:string,@Args('status') status:string) { return this.db.sponsorInquiry.update({where:{id},data:{status}}); }
 @Mutation(() => SettingsItem) saveAdminSettings(@Args('input') input:SettingsInput) { return this.db.siteSettings.upsert({where:{id:'main'},create:{id:'main',...input},update:input}); }
}
