import { NextResponse } from "next/server";


export async function POST(req: Request){

  try{

    const {
      email
    } = await req.json();



    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {

        method:"POST",

        headers:{

          Authorization:
          `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,

          "Content-Type":
          "application/json"

        },


        body:JSON.stringify({

          email,

          amount: 5000 * 100,

          callback_url:
          "http://localhost:3000/payment/success"

        })

      }
    );



    const data = await response.json();



    return NextResponse.json(data);


  }
  catch(error){

    console.error(error);

    return NextResponse.json(
      {
        error:"Payment initialization failed"
      },
      {
        status:500
      }
    );

  }

}