let data = [
    {
        "id": 1,
        "name": "Gol D. Roger",
        "desc": "Pirate King"
    },
    {
        "id": 2,
        "name": "Sir Crocodile",
        "desc": "Former-Shichibukai"
    },
    {
        "id": 3,
        "name": "Monkey D. Luffy",
        "desc": "Captain"
    },
];

exports.example = () => {
    return new Promise((resolve, reject) => {
        try {
            console.log(data)
            resolve(true)
        } catch (error) {
            reject(error)
        }
    });
}
