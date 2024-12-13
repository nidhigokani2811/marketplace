import {
    SubscriberArgs,
    type SubscriberConfig,
} from "@medusajs/medusa"
import { Modules } from "@medusajs/framework/utils"
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function resetPasswordTokenHandler({
    event: { data: {
        entity_id: email,
        token,
        actor_type,
    } },
    container,
}: SubscriberArgs<{ entity_id: string, token: string, actor_type: string }>) {
    const notificationModuleService = container.resolve(
        Modules.NOTIFICATION
    )

    const urlPrefix = actor_type !== "customer" ?
        "tscmarket://profile" :
        "https://admin.com"

    const resetUrl = `https://fir-analytics-b7c33.web.app/profile?token=${token}&email=${email}`;
    console.log(resetUrl);


    const msg = {
        to: email,
        from: process.env.SENDGRID_FROM,
        subject: 'Password Reset Request',
        text: `You requested a password reset. Click the link to reset your password: ${resetUrl}`,
        html: `<strong>You requested a password reset. Click the link to reset your password: <a href="${resetUrl}">${resetUrl}</a></strong>`,
    };

    try {
        await sgMail.send(msg);
        console.log('Email sent');
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

export const config: SubscriberConfig = {
    event: "auth.password_reset",
}