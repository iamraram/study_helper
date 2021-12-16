const express = require("express");
const app = express(); 

app.get("/", (req, res) => {
    res.sendFile('MainPage.html', { root: __dirname });
});
  
app.listen(3000, () =>
    console.log('서버 연결 완료')
);