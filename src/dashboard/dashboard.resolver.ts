import { Args, Field, ID, InputType, Int, ObjectType, Query, Resolver, Mutation } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { AdminGuard } from '../auth/admin.guard';

@ObjectType() class AdminNewsItem { @Field() id!:string; @Field() category!:string; @Field() title!:string; @Field() excerpt!:string; @Field() image!:string; @Field() tag!:string; @Field() featured!:boolean; @Field() published!:boolean; @Field() createdAt!:Date; }
@InputType() class NewsInput { @Field() category!:string; @Field() title!:string; @Field() excerpt!:string; @Field() image!:string; @Field() tag!:string; @Field() featured!:boolean; @Field() published!:boolean; }
@ObjectType() class AdminGalleryItem { @Field() id!:string; @Field() src!:string; @Field() title!:string; @Field() caption!:string; @Field() category!:string; @Field() position!:number; @Field() createdAt!:Date; }
@InputType() class GalleryInput { @Field() src!:string; @Field() title!:string; @Field() caption!:string; @Field() category!:string; @Field() position!:number; }
@ObjectType() class ContactItem { @Field(() => ID) id!: string; @Field() name!: string; @Field() email!: string; @Field({ nullable:true }) phone?: string; @Field({ nullable:true }) subject?: string; @Field({ nullable:true }) country?: string; @Field() message!: string; @Field() status!: string; @Field() createdAt!: Date; }
@ObjectType() class SponsorItem { @Field(() => ID) id!: string; @Field() name!: string; @Field() email!: string; @Field({nullable:true}) phone?: string; @Field({nullable:true}) country?: string; @Field({nullable:true}) amount?: string; @Field({nullable:true}) frequency?: string; @Field({nullable:true}) message?: string; @Field() status!: string; @Field() createdAt!: Date; }
@ObjectType() class SubscriberItem { @Field(() => ID) id!: string; @Field() email!: string; @Field() status!: string; @Field() createdAt!: Date; }
@ObjectType() class SettingsItem { @Field() ministryName!: string; @Field() email!: string; @Field() phone!: string; @Field() alternatePhone!: string; @Field() location!: string; @Field() whatsapp!: string; @Field() instagram!: string; @Field() facebook!: string; @Field() tiktok!: string; @Field() youtube!: string; @Field() threads!: string; @Field() mtnNumber!: string; @Field() mtnAccountName!: string; @Field() airtelNumber!: string; @Field() airtelAccountName!: string; @Field() equityBankName!: string; @Field() equityAccountName!: string; @Field() equityAccountNumber!: string; @Field() equitySwiftCode!: string; @Field() equityBranchName!: string; @Field() westernUnionReceiverName!: string; @Field() westernUnionCountry!: string; @Field() westernUnionCity!: string; @Field() westernUnionTelephone!: string; @Field() remitlyRecipientName!: string; @Field() remitlyCountry!: string; @Field() remitlyCity!: string; @Field() remitlyTelephone!: string; }
@ObjectType() class Overview { @Field(() => Int) contacts!: number; @Field(() => Int) sponsors!: number; @Field(() => Int) subscribers!: number; @Field(() => Int) newContacts!: number; @Field(() => Int) newSponsors!: number; @Field(() => Int) newSubscribers!: number; }
@InputType() class SettingsInput { @Field() ministryName!: string; @Field() email!: string; @Field() phone!: string; @Field() alternatePhone!: string; @Field() location!: string; @Field() whatsapp!: string; @Field() instagram!: string; @Field() facebook!: string; @Field() tiktok!: string; @Field() youtube!: string; @Field() threads!: string; }
@InputType() class ContactDetailsInput { @Field() email!: string; @Field() phone!: string; @Field() alternatePhone!: string; @Field() location!: string; }
@InputType() class OfflinePaymentInput {
 @Field() mtnNumber!: string; @Field() mtnAccountName!: string; @Field() airtelNumber!: string; @Field() airtelAccountName!: string;
 @Field() equityBankName!: string; @Field() equityAccountName!: string; @Field() equityAccountNumber!: string; @Field() equitySwiftCode!: string; @Field() equityBranchName!: string;
 @Field() westernUnionReceiverName!: string; @Field() westernUnionCountry!: string; @Field() westernUnionCity!: string; @Field() westernUnionTelephone!: string;
 @Field() remitlyRecipientName!: string; @Field() remitlyCountry!: string; @Field() remitlyCity!: string; @Field() remitlyTelephone!: string;
}
@Resolver()
@UseGuards(AdminGuard)
export class DashboardResolver {
 constructor(private db: PrismaService) {}
 @Query(() => [AdminGalleryItem]) adminGallery() { return this.db.galleryPost.findMany({orderBy:[{position:'asc'},{createdAt:'asc'}]}); }
 @Mutation(() => AdminGalleryItem) createGalleryPost(@Args('input') input:GalleryInput) { return this.db.galleryPost.create({data:input}); }
 @Mutation(() => AdminGalleryItem) updateGalleryPost(@Args('id') id:string,@Args('input') input:GalleryInput) { return this.db.galleryPost.update({where:{id},data:input}); }
 @Mutation(() => Boolean) async deleteGalleryPost(@Args('id') id:string) { await this.db.galleryPost.delete({where:{id}}); return true; }
 @Query(() => [AdminNewsItem]) adminNews() { return this.db.newsPost.findMany({orderBy:{createdAt:'desc'}}); }
 @Mutation(() => AdminNewsItem) createNews(@Args('input') input:NewsInput) { return this.db.newsPost.create({data:input}); }
 @Mutation(() => AdminNewsItem) updateNews(@Args('id') id:string,@Args('input') input:NewsInput) { return this.db.newsPost.update({where:{id},data:input}); }
 @Mutation(() => Boolean) async deleteNews(@Args('id') id:string) { await this.db.newsPost.delete({where:{id}}); return true; }
 private async uploadImageToGitHub(fileName:string, base64:string, prefix:"news"|"gallery"):Promise<string> {
  const token=process.env.GITHUB_TOKEN;
  if(!token) throw new Error("GitHub image uploads are not configured on the backend. Add GITHUB_TOKEN to the Railway backend environment.");
  const safe=fileName.normalize("NFKD").replace(/[^a-zA-Z0-9._-]/g,"-").replace(/-+/g,"-").slice(-100);
  const ext=safe.split(".").pop()?.toLowerCase();
  if(!["jpg","jpeg","png","webp","gif"].includes(ext||"")) throw new Error("Use a JPG, PNG, WEBP or GIF image.");
  if(!base64) throw new Error("No image data was received.");
  const content=base64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/,"").replace(/\s/g,"");
  if(!content) throw new Error("The image data is empty.");
  if(content.length>9500000) throw new Error("Image is too large for this upload. Please choose an image under 6 MB.");
  const owner=process.env.GITHUB_OWNER||"papaslovedev";
  const repo=process.env.GITHUB_REPO||"plcm_frontend";
  const branch=process.env.GITHUB_BRANCH||"main";
  const path="public/images/"+prefix+"-"+Date.now()+"-"+safe;
  const response=await fetch("https://api.github.com/repos/"+owner+"/"+repo+"/contents/"+path,{
   method:"PUT",
   headers:{Authorization:"Bearer "+token,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28","Content-Type":"application/json"},
   body:JSON.stringify({message:"Upload "+prefix+" image "+safe,content,branch}),
  });
  const result:any=await response.json();
  if(!response.ok) throw new Error("GitHub image upload failed ("+response.status+"): "+(result.message||"Unknown GitHub error."));
  return "https://raw.githubusercontent.com/"+owner+"/"+repo+"/"+branch+"/"+path;
 }
 @Mutation(() => String)
 uploadNewsImage(@Args("fileName") fileName:string,@Args("base64") base64:string):Promise<string> {
  return this.uploadImageToGitHub(fileName,base64,"news");
 }
 @Mutation(() => String)
 uploadGalleryImage(@Args("fileName") fileName:string,@Args("base64") base64:string):Promise<string> {
  return this.uploadImageToGitHub(fileName,base64,"gallery");
 }
 @Query(() => Overview) async adminOverview() { const [contacts,sponsors,subscribers,newContacts,newSponsors,newSubscribers]=await Promise.all([this.db.contactMessage.count(),this.db.sponsorInquiry.count(),this.db.newsletterSubscriber.count(),this.db.contactMessage.count({where:{status:'NEW'}}),this.db.sponsorInquiry.count({where:{status:'NEW'}}),this.db.newsletterSubscriber.count({where:{status:'NEW'}})]); return {contacts,sponsors,subscribers,newContacts,newSponsors,newSubscribers}; }
 @Query(() => [ContactItem]) adminContacts() { return this.db.contactMessage.findMany({orderBy:{createdAt:'desc'}}); }
 @Query(() => [SponsorItem]) adminSponsors() { return this.db.sponsorInquiry.findMany({orderBy:{createdAt:'desc'}}); }
 @Query(() => [SubscriberItem]) adminSubscribers() { return this.db.newsletterSubscriber.findMany({orderBy:{createdAt:'desc'}}); }
 @Mutation(() => SubscriberItem) updateSubscriberStatus(@Args('id') id:string,@Args('status') status:string) { if (!['APPROVED','DECLINED'].includes(status)) throw new Error('Invalid subscriber status'); return this.db.newsletterSubscriber.update({where:{id},data:{status}}); }
 @Query(() => SettingsItem) async adminSettings() { return this.db.siteSettings.upsert({where:{id:'main'},create:{id:'main'},update:{}}); }
 @Mutation(() => ContactItem) updateContactStatus(@Args('id') id:string,@Args('status') status:string) { if (!['HANDLED','IGNORED','NEW'].includes(status)) throw new Error('Invalid contact status'); return this.db.contactMessage.update({where:{id},data:{status}}); }
 @Mutation(() => SponsorItem) updateSponsorStatus(@Args('id') id:string,@Args('status') status:string) { if (!['ATTENDED','ARCHIVED','NEW'].includes(status)) throw new Error('Invalid sponsor inquiry status'); return this.db.sponsorInquiry.update({where:{id},data:{status}}); }
 @Mutation(() => SettingsItem) saveContactDetails(@Args("input") input:ContactDetailsInput) { return this.db.siteSettings.upsert({where:{id:"main"},create:{id:"main",email:input.email,phone:input.phone,alternatePhone:input.alternatePhone,location:input.location},update:{email:input.email,phone:input.phone,alternatePhone:input.alternatePhone,location:input.location}}); }
 @Mutation(() => SettingsItem) saveAdminSettings(@Args('input') input:SettingsInput) { return this.db.siteSettings.upsert({where:{id:'main'},create:{id:'main',...input},update:input}); }
 @Mutation(() => SettingsItem) saveOfflinePaymentOptions(@Args('input') input:OfflinePaymentInput) { return this.db.siteSettings.upsert({where:{id:'main'},create:{id:'main',...input},update:input}); }
}