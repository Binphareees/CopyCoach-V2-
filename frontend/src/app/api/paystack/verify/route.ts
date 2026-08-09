import { NextResponse } from "next/server";


export async function GET(
  req: Request
){

  const {searchParams} =
    new URL(req.url);


  const reference =
    searchParams.get("reference");


  if(!reference){

    return NextResponse.json(
      {
        error:"No reference provided"
      },
      {
        status:400
      }
    );

  }


  const response =
    await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {

        headers:{

          Authorization:
          `Bearer ${process.env.PAYSTACK_SECRET_KEY}`

        }

      }
    );


  const data =
    await response.json();



  return NextResponse.json(data);

}