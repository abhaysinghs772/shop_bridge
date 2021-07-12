const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/shop_bridge_DB", { useNewUrlParser: true });

const itemSchema = {
    name: String,
    description: String,
    price: Number,
}

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "welcome to your inventory!"
});

const item2 = new Item({
    name: "hit the + button to add a new item."
});

const item3 = new Item({
    name: "<-- hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {

    name: String,
    items: [itemSchema]
}
const List = mongoose.model("List", listSchema)

app.set('view engine', 'ejs');

// add default items to guide users
app.get('/', function (req, res) {
    Item.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("successfully saved default items to DB!");
                }
                res.redirect("/");
            });
        } else {
            res.render("homepage", { listTitle: "Shop Bridge", newListItems: foundItems });
        }
    });
});

// creating custom item routes on the basis of items present in inventory

// app.get("/:customListName", function (req, res) {
//     // console.log(req.params.customListName);
//     const customListName = _.capitalize(req.params.customListName);

//     // console.log(customListName); => without /home it logs favicon 

//     List.findOne({ name: customListName }, function (err, foundList) {
//         if (!err) {
//             if (!foundList) {
//                 // create a new list
//                 const list = new List({
//                     name: customListName,
//                     items: defaultItems
//                 });
//                 list.save();
//                 res.redirect("/" + customListName);
//                 // res.redirect("/home/:customListName");

//             } else {
//                 // show an existing list
//                 res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
//             }
//         }
//     });
// });

// create "itemname" to store new to do stuffs in list when "+" is submitted
app.post('/', function (req, res) {
    const itemName = req.body.new_Item_Name;
    const itemDescription = req.body.new_Item_desc;
    const itemPrice = req.body.new_Item_price;
    const listName = req.body.list;

    const item = new Item({
        name: itemName,
        description: itemDescription,
        price: itemPrice
    });

    if (listName === "Shop Bridge") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName }, function (err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
});

app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    if (listName === "shop bridge") {
        Item.findByIdAndRemove(checkedItemId, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("successfully removed item");
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function (err, foundList) {
            if (!err) {
                res.redirect("/" + listName);
            }
        });
    }
});

app.listen(process.env.PORT || 3000, function () {
    console.log("server is started at port 3000");
});

// homepage.ejs was list.ejs