import express from "express";
import dotenv from "dotenv";
import stripePackage from "stripe";

// Carregando variáveis
dotenv.config();

// Iniciando o server
const app = express();

app.use(express.static("public"));
app.use(express.json());

// Rota de casa
app.get("/", (req, res) => {
    res.sendFile("index.html", { root: "public" });
});

// Sucesso
app.get("/success", (req, res) => {
    res.sendFile("success.html", { root: "public" });
});

// Cancelamento
app.get("/cancel", (req, res) => {
    res.sendFile("cancel.html", { root: "public" });
});

// Stripe
const stripeGateway = stripePackage(process.env.stripe_api); // Alteração aqui
const DOMAIN = process.env.DOMAIN;


app.post("/stripe-checkout", async (req, res) => {
    const lineItems = req.body.items.map((item) => {
        const unitAmount = parseInt(item.price.replace(/[^0-9.-]+/g, "") * 100);
        console.log("item-price:", item.price);
        console.log("unitAmount:", unitAmount);
        return {
            price_data: {
                currency: "usd",
                product_data: {
                    name: item.title,
                    images: [item.productImg]
                },
                unit_amount: unitAmount,
            },
            quantity: item.quantity,
        };
    });
    console.log("lineItems:", lineItems);

    // Sessão de verificação
    const session = await stripeGateway.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        success_url: `${DOMAIN}/success`,
        cancel_url: `${DOMAIN}/cancel`,
        line_items: lineItems,
        billing_address_collection: "required",
    });
    res.json({ url: session.url });
});

app.listen(3000, () => {
    console.log("Listening on port 3000;");
});
