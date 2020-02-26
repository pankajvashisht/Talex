const DbConnection = require("./database");
const config = require("../config/config");
const fs = require("fs");
const path = "../src/Models";

class Query {
  
  constructor() {
    this.db = new DbConnection();
    this.table = "";
    this.select = "select * from ";
    this.or , this.and = false;
  }


  table(name){
    this.table = name;
  }

  select(fields = null){
    if(typeof fields === Array){
      this.fields  = fields.toString();
    }else{
      this.fields = "*";
    }
  }

 where(condition){
   this.and = false;
   for(let c in condition){
      this.and = true;
   }
 } 

 whereOr(condition){
   this.or = false;
   for(let c in condition){

  }
 }

  async find(table_name, type, ...condition) {
    try {
      let table = table_name;
      if (typeof condition[0] == "undefined") {
        condition[0] = [];
      }
      if (fs.existsSync(config.root_path + "model/" + table_name + ".js")) {
        let models = require(path + table_name);
        let infomation = new models();

        if (typeof infomation.table_name !== "undefined") {
          table = infomation.table_name;
        }
      }
      let query = "select";

      if (typeof condition[0].fields != "undefined") {
        let fields = condition[0].fields.toString();
        query += " " + fields;
      } else {
        query += " * ";
      }
      query += " from " + table;

      if (typeof condition[0].conditions != "undefined") {
        query += " where ";
        let its_first = 0;
        for (let c in condition[0].conditions) {
          if (c == "or") {
            for (let a in condition[0].conditions[c]) {
              if (its_first == 0) {
                query +=
                  " `" +
                  table +
                  "`.`" +
                  a +
                  "` = '" +
                  condition[0].conditions[c][a] +
                  "'";
              } else {
                query +=
                  " or `" +
                  table +
                  "`.`" +
                  a +
                  "` = '" +
                  condition[0].conditions[c][a] +
                  "' ";
              }
              its_first++;
            }
          } else {
            if (its_first == 0 && c == 1) {
              query += c + "  " + condition[0].conditions[c] + "";
            }
            if (its_first == 0 && c !== "1") {
              query +=
                "`" +
                table +
                "`.`" +
                c +
                "` = '" +
                condition[0].conditions[c] +
                "'";
            } else if (its_first != 0) {
              query +=
                " and `" +
                table +
                "`.`" +
                c +
                "` = '" +
                condition[0].conditions[c] +
                "'";
            }
            its_first++;
          }
        }
      }

      if (typeof condition.group != "undefined") {
        // ADD LOGIIC THERE
      }
      if (typeof condition.limit != "undefined") {
        // ADD LOGIIC THERE
      }
      let query_result = await this.first(query);
      if (type == "first") {
        return query_result[0];
      }
      return query_result;
    } catch (e) {
      console.log("Error: ===>", e);
      throw e;
    }
  }

  async findall(query) {
    query = String(query);
    const [row, fields] = await this.db.db_connect.query(query);
    return row;
  }

  async first(qry) {
    console.log(qry);
    const query = String(qry);
    try {
      let result = new Promise((resolve, reject) => {
        this.db.db_connect.query(query, function(error, results) {
          if (error) reject(error);
          if (results) {
            resolve(results);
          }
        });
      });

      return await result
        .then(data => {
          return data;
        })
        .catch(err => {
          throw err;
        });
    } catch (e) {
      throw { code: 400, message: e };
    }
  }

  async Query(query, type) {
    try {
      query = String(query);
      const [rows, fields] = await this.db.db_connect.query(query);
      if (rows) {
        if (type == "select") {
          return rows;
        } else if (type == "insert") {
          return rows.insertId;
        } else if (type == "update") {
          return rows.insertId;
        }
      } else {
        return [];
      }
    } catch (err) {
      console.log("Error: ===>", e);
      err.message = JSON.stringify(err);
      err.code = 400;
      throw err;
    }
  }
  async save(table_name, object) {
    if (!object.hasOwnProperty("id")) {
      object.created = Math.round(new Date().getTime() / 1000, 0);
    }

    object.modified = Math.round(new Date().getTime() / 1000, 0);

    let get_scheme = "SHOW COLUMNS FROM " + table_name;
    let row = new Promise(R => {
      this.db.db_connect.query(String(get_scheme), function(error, result) {
        if (error) throw error;
        R(result);
      });
    });
    row = await row.then(data => {
      return data;
    });

    let query = "";
    let update = false;
    if (object.hasOwnProperty("id")) {
      query = "Update `" + table_name + "` SET ";
      update = true;
    } else {
      query = "Insert into `" + table_name + "` SET ";
    }
    let value = [];
    for (let i in row) {
      if (object.hasOwnProperty(row[i].Field)) {
        query += row[i].Field + " = ? ,";
        value.push(object[row[i].Field]);
      }
    }

    query = query.substring(",", query.length - 1);
    if (object.hasOwnProperty("id")) {
      query += " where id  =  " + object.id;
    }
    try {
      const result = new Promise((resolve, reject) => {
        this.db.db_connect.query(query, value, function(error, result) {
          if (error) reject(error);
          if (result) {
            let id = update ? object.id : result.insertId;
            resolve(id);
          }
        });
      });
      return await result
        .then(data => {
          return data;
        })
        .catch(err => {
          throw err;
        });
    } catch (err) {
      throw { code: 400, message: err };
    }
  }
}

module.exports = Query;
