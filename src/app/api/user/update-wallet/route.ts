import { createClient } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

/**
 * Update user wallet address
 */
export async function POST(request: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { wallet_address } = await request.json()

        if (!wallet_address || !wallet_address.startsWith('0x')) {
            return NextResponse.json(
                { error: 'Invalid wallet address' },
                { status: 400 }
            )
        }

        const supabase = createClient()

        // Update user's wallet address
        const { data, error } = await supabase
            .from('users')
            .update({ wallet_address })
            .eq('id', userId)
            .select()
            .single()

        if (error) {
            console.error('Error updating wallet address:', error)
            return NextResponse.json(
                { error: 'Failed to update wallet address' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            wallet_address: data.wallet_address
        })
    } catch (error: any) {
        console.error('Error in update-wallet endpoint:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
