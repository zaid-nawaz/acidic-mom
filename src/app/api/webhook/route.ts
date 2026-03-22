import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest , NextResponse } from 'next/server'
import {prisma} from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req)
    const data : any = evt.data;

    if(evt.type === 'user.created'){

    const clerkUserId = data.id
    const email = data.email_addresses?.[0]?.email_address
    const first_name = data.first_name || null
    const last_name = data.last_name || null
    const imageUrl = data.image_url || data.profile_image_url || null
    const NewUser = await prisma.user.upsert({
      where : { clerkUserId }, 
      update : {},
      create : {
        clerkUserId,
        email,
        first_name,
        last_name,
        imageUrl,
      }
    })

    console.log('✅ User created:', NewUser);
    }

    else if(evt.type === 'user.deleted'){
    const clerkUserId = data.id;
    const deletedUser = await prisma.user.deleteMany({
      where: { clerkUserId },
    })
    console.log('🗑️ User deleted:', deletedUser)
    }

    const { id } = evt.data
    const eventType = evt.type
    console.log(`Received webhook with ID ${id} and event type of ${eventType}`)
    console.log('Webhook payload:', evt.data)

    return NextResponse.json({ message: 'Webhook received'})
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error verifying webhook', { status: 400 })
  }
}
