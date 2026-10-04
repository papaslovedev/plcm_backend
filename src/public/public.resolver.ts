import { Args, Field, InputType, Mutation, ObjectType, Resolver } from '@nestjs/graphql';
import { PrismaService } from '../prisma/prisma.module';
@InputType() class ContactInput { @Field() name!: string; @Field() email!: string; @Field({nullable:true}) phone?: string; @Field({nullable:true}) subject?: string; @Field() message!: string; }
@InputType() class SponsorInput { @Field() name!: string; @Field() email!: string; @Field({nullable:true}) phone?: string; @Field({nullable:true}) country?: string; @Field({nullable:true}) amount?: string; @Field({nullable:true}) frequency?: string; @Field({nullable:true}) message?: string; }
@ObjectType() class PublicResult { @Field() success!: boolean; }
@Resolver()
export class PublicResolver {
 constructor(private db:PrismaService) {}
 @Mutation(() => PublicResult) async submitContact(@Args('input') input:ContactInput) { await this.db.contactMessage.create({data:input}); return {success:true}; }
 @Mutation(() => PublicResult) async submitSponsorInquiry(@Args('input') input:SponsorInput) { await this.db.sponsorInquiry.create({data:input}); return {success:true}; }
 @Mutation(() => PublicResult) async subscribeNewsletter(@Args('email') email:string) { await this.db.newsletterSubscriber.upsert({where:{email:email.trim().toLowerCase()},create:{email:email.trim().toLowerCase()},update:{}}); return {success:true}; }
}
