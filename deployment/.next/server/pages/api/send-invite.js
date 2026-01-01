"use strict";(()=>{var e={};e.id=326,e.ids=[326],e.modules={145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},6249:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,i){return i in t?t[i]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,i)):"function"==typeof t&&"default"===i?t:void 0}}})},886:(e,t,i)=>{i.r(t),i.d(t,{config:()=>h,default:()=>c,routeModule:()=>g});var r={};i.r(r),i.d(r,{default:()=>u});var o=i(1802),s=i(7153),n=i(6249);let a=require("nodemailer");var l=i.n(a);let p=l().createTransport({host:"smtp.gmail.com",port:parseInt("587"),secure:!1,auth:{user:"nikhil.aerabati@gmail.com",pass:"uxhq elob rpph xrgd"}}),d=async({to:e,inviteLink:t,serverName:i,senderName:r})=>{let o={from:'"SquareUp" <nikhil.aerabati@gmail.com>',to:e,subject:`You're invited to join ${i} on SquareUp!`,html:`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h1 style="color: #0070BA; text-align: center; margin-bottom: 20px;">🎉 You're Invited!</h1>
          <p style="font-size: 16px; line-height: 1.6;">Hello,</p>
          <p style="font-size: 16px; line-height: 1.6;"><b>${r}</b> has invited you to join the <b>"${i}"</b> group on SquareUp!</p>
          <p style="font-size: 16px; line-height: 1.6;">SquareUp is an expense management app that helps groups track and split expenses fairly with friends and family.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${t}"
               style="background-color: #0070BA; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(0,112,186,0.3);">
              🚀 Join "${i}"
            </a>
          </div>

          <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0070BA; margin-top: 0;">What happens when you join?</h3>
            <ul style="color: #333; padding-left: 20px;">
              <li>You'll be added to the shared "${i}" server</li>
              <li>You can track expenses and split costs with group members in real-time</li>
              <li>You can invite others to join this shared expense group</li>
              <li>Access to all SquareUp features for managing shared expenses</li>
            </ul>
          </div>

          <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
            Welcome to the SquareUp community! 🎉<br>
            <small>The SquareUp Team</small>
          </p>
        </div>
      </div>
    `,text:`
🎉 You're Invited to "${i}"!

${r} has invited you to join the "${i}" group on SquareUp!

SquareUp helps groups track and split expenses fairly with friends and family.

When you join, you'll get:
- Access to the shared "${i}" server
- Real-time expense tracking with group members
- Tools to split costs fairly
- Ability to invite others to join

Click here to join: ${t}

Welcome to the community! 🎉

The SquareUp Team
    `};try{let e=await p.sendMail(o);return console.log("Message sent: %s",e.messageId),console.log("Preview URL: %s",l().getTestMessageUrl(e)),{success:!0,previewUrl:l().getTestMessageUrl(e)}}catch(e){return console.error("Error sending email:",e),{success:!1,error:e.message}}};async function u(e,t){if("POST"===e.method){let{to:i,inviteLink:r,serverName:o,senderName:s}=e.body;if(!i||!r||!o||!s)return t.status(400).json({message:"Missing required fields"});let n=await d({to:i,inviteLink:r,serverName:o,senderName:s});n.success?t.status(200).json({message:"Invitation email sent successfully",previewUrl:n.previewUrl}):t.status(500).json({message:"Failed to send invitation email",error:n.error})}else t.setHeader("Allow",["POST"]),t.status(405).end(`Method ${e.method} Not Allowed`)}let c=(0,n.l)(r,"default"),h=(0,n.l)(r,"config"),g=new o.PagesAPIRouteModule({definition:{kind:s.x.PAGES_API,page:"/api/send-invite",pathname:"/api/send-invite",bundlePath:"",filename:""},userland:r})},7153:(e,t)=>{var i;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return i}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(i||(i={}))},1802:(e,t,i)=>{e.exports=i(145)}};var t=require("../../webpack-api-runtime.js");t.C(e);var i=t(t.s=886);module.exports=i})();