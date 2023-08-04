var express = require('express');// 引入 Express 模块

const moment = require("moment");
const {config,sql} = require("../db/conf.js");
var router = express.Router()// 创建一个路由容器
const { deleteRecord, getRecordById, getRecordByIdDict, updateRecord, updateDict, queryPageRecords, queryPageDict } = require("../methods.js");




// 添加数据到 system_dict_type 表
router.post("/createDict", (req, res) => {
    const data = req.body;
    const currentTime = new Date().toLocaleString();
    data.create_time = moment(currentTime, "YYYY/MM/DD HH:mm:ss").format(
        "YYYY-MM-DD HH:mm:ss"
    );
    data.status = data.status == "开启" ? 0 : 1;
    // 构建 SQL 查询语句和参数
    const sqlQuery = `INSERT INTO system_dict_type (name, type, status, create_time, remark)
    SELECT '${data.name}', '${data.type}', '${data.status}', '${data.create_time}', '${data.remark}'
    WHERE NOT EXISTS (
        SELECT 1
        FROM system_dict_type
        WHERE name = '${data.name}' AND type = '${data.type}'
    );`;
    const params = {
        name: data.name,
        type: data.type,
        status: data.status,
        create_time: data.create_time,
    };
    // 执行数据库插入操作
    sql
        .query(sqlQuery)
        .then(() => {
            console.log("数据插入成功");
            res.send("数据插入成功");
        })
        .catch((error) => {
            console.error("插入数据失败", error);
            res.status(500).send("插入数据失败");
        });
});

// 添加数据到 system_dict_data 表
router.post("/createDictData", (req, res) => {
    const data = req.body;
    const currentTime = new Date().toLocaleString();
    data.create_time = moment(currentTime, "YYYY/MM/DD HH:mm:ss").format(
        "YYYY-MM-DD HH:mm:ss"
    );
    data.status = data.status == "开启" ? 0 : 1;
    data.id_level = data.param_id == "" || data.param_id == null ? 1 : 0;
    // 如果 data.id_level 等于 0，则添加另一个 SQL 语句来更新 id_level 为 2
    if (data.id_level == 0) {
        const updateSqlQuery = `UPDATE system_dict_data SET id_level = 2 WHERE label = '${data.param_id}';`;
        sql.query(updateSqlQuery)
    }
    // 构建 SQL 查询语句和参数
    //修改name

    const sqlQuery = `INSERT INTO system_dict_data (dict_type,value, label, status, create_time,param_id,sort,color_type,css_class,remark,id_level) 
    SELECT '${data.dict_type}','${data.value}','${data.label}','${data.status}','${data.create_time}','${data.param_id}','${data.sort}','${data.color_type}','${data.css_class}','${data.remark}','${data.id_level}'
    WHERE NOT EXISTS (
        SELECT 1
        FROM system_dict_data
        WHERE dict_type = '${data.dict_type}' AND value = '${data.value}' AND label = '${data.label}'
    );`;
    // 执行数据库插入操作
    sql
        .query(sqlQuery)
        .then(() => {
            res.send("数据插入成功");
        })
        .catch((error) => {
            console.error("插入数据失败", error);
            res.status(500).send("插入数据失败");
        });
});



// 删除记录的路由处理程序
router.delete("/record/:tableName/:id", async (req, res) => {
    const tableName = req.params.tableName;
    const id = req.params.id;
    try {
        const deletedRows = await deleteRecord(tableName, id);
        res.json(deletedRows);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "An error occurred" });
    }
});



// 根据ID查询system_dict_type记录
router.get("/record/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const record = await getRecordById(id);
        res.json(record);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "An error occurred" });
    }
});



// 根据ID查询system_dict_data记录
router.get("/recordDict/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const record = await getRecordByIdDict(id);
        res.json(record);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "An error occurred" });
    }
});



// 更新system_dict_type记录
router.put("/record/:id", async (req, res) => {
    const id = req.params.id;
    const newData = req.body;

    try {
        await updateRecord(id, newData);
        res.sendStatus(200);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "An error occurred" });
    }
});



// 更新system_dict_data记录
router.put("/updict/:id", async (req, res) => {
    const id = req.params.id;
    const newData = req.body;
    try {
        await updateDict(id, newData);
        res.sendStatus(200);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "An error occurred" });
    }
});

// 路由：查询字典数据记录system_dict_type
router.post("/searchData", async (req, res) => {
    const data = req.body;
    data.status='开启'
    try {
        const { results, totalCount } = await queryPageRecords(
            data.pageNo,
            data.pageSize,
            data.name,
            data.type,
            data.status,
            data.create_time
        );
        res.json({ results, totalCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred" });
    }
});

// 路由：查询字典数据记录system_dict_data
router.post("/searchDataDict", async (req, res) => {
    const data = req.body;
    try {
        const { results, totalCount, parentResult, allParentResult } =
            await queryPageDict(
                data.pageNo,
                data.pageSize,
                data.name,
                data.label,
                data.status,
                data.type
            );
        res.json({ results, totalCount, parentResult, allParentResult });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred" });
    }
});

//根据type查找字典数据的路由
router.get("/singleStage/:type", async (req, res) => {
    const type = req.params.type;
    try {
        const sqlQuery = `SELECT * FROM system_dict_data WHERE deleted = 0 AND dict_type ='${type}' ORDER BY id`;
        const pool = await sql.connect(config);
        const result = await pool.request().query(sqlQuery);
        const results = result.recordset;
        let index = 1;
        const response = results.map((item) => {
            return {
                value: item.value,
                text: item.label,
                index: index++,
                defaultselect: null,
            };
        });
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred" });
    }
});

//生成json的路由
router.get("/multiStage/:type", async (req, res) => {
    const type = req.params.type;
    try {
        const sqlQuery = `SELECT * FROM system_dict_data WHERE deleted = 0 AND dict_type ='${type}' ORDER BY id`;
        const pool = await sql.connect(config);
        const result = await pool.request().query(sqlQuery);
        const results = result.recordset;
        // 查询id_level等于1的记录，并生成multi数组
        let id = 0;
        const level1Records = results.filter((record) => record.id_level === 1);
        let multi = level1Records.map((record, index) => ({
            id: (id++).toString(),
            text: record.label,
            value: record.value,
            iconCls: "icon-no",
            state: "closed",
            attributes: {
                groupno: "",
                selected: null,
            },
        }));
        // 查询id_level等于2的记录
        const level2Records = results.filter((record) => record.id_level === 2);
        level2Records.forEach((record) => {
            multi.push({
                id: (id++).toString(),
                text: record.label,
                value: record.value,
                iconCls: "icon-no",
                state: "closed",
                attributes: {
                    groupno: "",
                    selected: null,
                },
                children: [],
            })
            const childrenRecords = results.filter((item) => item.param_id === record.label);
            let copyid = id;
            childrenRecords.map((item) => {
                multi[id - 1].children.push({
                    id: (copyid++).toString(),
                    text: item.label,
                    value: item.value,
                    iconCls: "icon-no",
                    state: "closed",
                    attributes: {
                        groupno: "",
                        selected: null,
                    },
                })

            })
        });
         res.setHeader('Content-Type', 'application/json');
        res.json(multi);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred" });
    }
});

module.exports = {
    router: router
  };