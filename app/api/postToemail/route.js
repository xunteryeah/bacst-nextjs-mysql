import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/senEmail";

export async function POST(request) {
    try {
        const data = await request.json()
        const { name, tophone, message, purpose } = data;

        if (!name || !tophone || !message || !purpose) {
            return NextResponse.json({ error: "缺少必要字段" }, { status: 400 });
        }

        await sendEmail({ name, tophone, message, purpose });

        return NextResponse.json({
            message: 'Data inserted successfully',
        }, { status: 201 })
    } catch (error) {
        console.error('Error in postToemail:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
