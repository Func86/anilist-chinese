const fs = require("fs");
const MariaClient = require("mariasql");
const config = require("./config");

const c = new MariaClient({
  host: config.db_host,
  user: config.db_user,
  password: config.db_pass,
  db: config.db_database,
  charset: 'utf8'
});


c.query("SELECT * FROM anilist_chinese", (error, rows) => {
  const db = rows.map(e=>({id: parseInt(e.id), title: JSON.parse(e.json).title.chinese}));
  const db_str = db.map(e=>JSON.stringify(e).replace(/"id":/g, "id:").replace(/"title":/g, "title:")).join(",\n");
  const template = fs.readFileSync("template.js", "utf8");
  const js_str = template.replace("var database = [];", "var database = [\n"+db_str+"\n];");
  if (js_str !== fs.readFileSync("cache.txt", "utf8")) {
    fs.writeFileSync("cache.txt", js_str);
    const d = new Date();
    const version_str = `1.${d.getFullYear()}.${d.getMonth()+1}.${d.getDate()}`;
    const js_file_str = js_str.replace("// @version      1.0", `// @version      ${version_str}`);
    fs.writeFileSync("anilist-chinese.user.js", js_file_str);
    console.log(`build completed (version ${version_str})`);
  } else {
    console.log("build is the same, js file not updated.");
  }
});

c.end();