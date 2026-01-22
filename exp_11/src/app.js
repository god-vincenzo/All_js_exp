import express from "express";
const app = express();

app.use(express.json())
const cards = [
    { id: 1, suit: "Hearts", value: "Ace" },
    { id: 2, suit: "Spades", value: "King" },
    { id: 3, suit: "Diamonds", value: "Queen" }
]
app.get("/", (req, res) => {
    res.send(" Hello from Server")
})



app.get("/cards", (req, res) => {
    res.status(200).json({
        message: "All cards fetched",
        cards: cards
    })
})
app.get("/cards/:id", (req, res) => {
    const cardId = req.params.id;
    const card = cards.find((c) => c.id === Number(cardId));

    if (!card) {
        res.status(404).json({
            message: "Card not found",
            card: null
        })

    }
    res.status(200).json({
        message: "Card found",
        card: card
    })
})
app.post("/cards", (req, res)=>{
    const data= req.body;
    const newCard = {
        id:Date.now(),
        suit: data.suit,
        value : data.value
    }
    cards.push(newCard);
    res.status(201).json({
        message: "Card Created",
        cards: cards
    })
})
app.listen(3000, () => {
    console.log("Server started on port 3000");
}); 