const fastCSV = require("fast-csv");
const _ = require("lodash");
const fs = require("fs");

const INPUT_FOLDER_PATH = "./input-folder/";
const OUTPUT_FOLDER_PATH = "./output-folder/";

function writeToFile(file, newList) {
  console.log("start to writeToFile", file);

  var csvStream = fastCSV.format({ headers: true }),
    writableStream = fs.createWriteStream(
      `./${OUTPUT_FOLDER_PATH}/${file}.csv`
    );

  writableStream.on("finish", function () {
    console.log("DONE!");
  });
  csvStream.pipe(writableStream);
  newList.forEach((item) => {
    csvStream.write(item);
  });
  csvStream.end();
}

function convertToCSVFile(file) {
  console.log("start to convertToCSVFile", file);
  const trelloJson = require(`./${INPUT_FOLDER_PATH}/${file}`);
  const lists = trelloJson.lists;
  const members = trelloJson.members;
  const newList = [];

  for (const card of trelloJson.cards) {
    const listName = _.find(lists, { id: card.idList }).name;
    let member = null;
    if (card.idMembers[0]) {
      member = _.find(members, { id: card.idMembers[0] }).fullName;
    }
    const cardName = card.name;
    const cardDescription = card.desc; // 取得卡片描述
    const cardLabels = card.labels.map((label) => label.name).join(", "); // 取得卡片標籤
    const cardComments = trelloJson.actions
      ? trelloJson.actions
          .filter(
            (action) =>
              action.type === "commentCard" && action.data.card.id === card.id
          )
          .map((action) => action.data.text)
          .join(", ")
      : "";

    // 获取附件的URL
    const attachments = card.attachments
      ? card.attachments.map((attachment) => attachment.url).join(", ")
      : "";

    newList.push({
      listName: listName,
      title: cardName,
      description: cardDescription,
      labels: cardLabels,
      comments: cardComments,
      attachments: attachments, // 添加附件URL字段
      shortUrl: card.shortUrl,
      url: card.url,
      member: member,
    });
  }

  writeToFile(file, newList);
}

function getFilesList() {
  console.log("-------getFilesList()");
  const fs = require("fs");
  return fs.readdirSync(INPUT_FOLDER_PATH);
}

(function main() {
  console.log("-------app starting ----------");
  const files = getFilesList();
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    convertToCSVFile(file);
  }
  console.log("-------app finishing ----------");
})();
