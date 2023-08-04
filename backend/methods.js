const {sql,config}=require("./db/conf.js");
const moment = require("moment");
// 通用的删除记录函数
const deleteRecord = async (tableName, id) => {
    const currentTime = new Date().toLocaleString();
    const deletedTime = moment(currentTime, "YYYY/MM/DD HH:mm:ss").format(
        "YYYY-MM-DD HH:mm:ss"
    );

    const sqlQuery = `UPDATE ${tableName} SET deleted = 1, deleted_time = DATEADD(HOUR, +8, @deletedTime) WHERE id = @id;`;
    const pool = await sql.connect(config);
    const result = await pool
        .request()
        .input("deletedTime", sql.DateTime, deletedTime)
        .input("id", sql.Int, id)
        .query(sqlQuery);

    return result.rowsAffected[0];
};

// 根据ID查询system_dict_type记录
const getRecordById = async (id) => {
    const sqlQuery = `SELECT * FROM system_dict_type WHERE id = @id;`;

    const pool = await sql.connect(config);
    const result = await pool.request().input("id", sql.Int, id).query(sqlQuery);

    return result.recordset[0];
};

// 根据ID查询system_dict_data记录
const getRecordByIdDict = async (id) => {
    const sqlQuery = `SELECT * FROM system_dict_data WHERE id = @id;`;

    const pool = await sql.connect(config);
    const result = await pool.request().input("id", sql.Int, id).query(sqlQuery);

    return result.recordset[0];
};

// 更新system_dict_type记录
const updateRecord = async (id, newData) => {
    const currentTime = new Date().toLocaleString();
    newData.update_time = moment(currentTime, "YYYY/MM/DD HH:mm:ss").format(
        "YYYY-MM-DD HH:mm:ss"
    );
    newData.status = newData.status == "开启" ? 0 : 1;

    const sqlQuery = `UPDATE system_dict_type SET name = @name, type = @type, status = @status, update_time = DATEADD(HOUR, +8, @update_time),remark=@remark WHERE id = @id;`;

    const pool = await sql.connect(config);
    const result = await pool
        .request()
        .input("name", sql.VarChar, newData.name)
        .input("type", sql.VarChar, newData.type)
        .input("status", sql.Int, newData.status)
        .input("remark", sql.VarChar, newData.remark)
        .input("update_time", sql.DateTime, newData.update_time)
        .input("id", sql.Int, id)
        .query(sqlQuery);

    return result.rowsAffected[0];
};

// 更新system_dict_data记录
const updateDict = async (id, newData) => {
    const currentTime = new Date().toLocaleString();
    newData.update_time = moment(currentTime, "YYYY/MM/DD HH:mm:ss").format(
        "YYYY-MM-DD HH:mm:ss"
    );
    newData.create_time = moment(
        newData.create_time,
        "YYYY/MM/DD HH:mm:ss"
    ).format("YYYY-MM-DD HH:mm:ss");
    newData.status = newData.status == "开启" ? 0 : 1;
    newData.deleted = 0;
    newData.id_level = newData.param_id == "" || newData.param_id == null ? 1 : 0;
    if (newData.id_level == 0) {
        const updateSqlQuery = `UPDATE system_dict_data SET id_level = 2 WHERE label = '${data.param_id}';`;
        sql.query(updateSqlQuery)
    }
    //dict_type,value, label, status, create_time,param_id,sort,css_class,remark
    const sqlQuery = `UPDATE system_dict_data SET dict_type = @dict_type,value = @value, label = @label, status = @status, remark = @remark,
    update_time = DATEADD(HOUR, +8, @update_time), deleted = @deleted,sort = @sort,css_class = @css_class,color_type = @color_type,param_id = @param_id,id_level = @id_level WHERE id = @id;`;

    const pool = await sql.connect(config);
    const result = await pool
        .request()
        .input("dict_type", sql.VarChar, newData.dict_type)
        .input("value", sql.VarChar, newData.value)
        .input("label", sql.VarChar, newData.label)
        .input("status", sql.Int, newData.status)
        .input("remark", sql.VarChar, newData.remark)
        .input("update_time", sql.DateTime, newData.update_time)
        .input("deleted", sql.Int, newData.deleted)
        .input("sort", sql.Int, newData.sort)
        .input("css_class", sql.VarChar, newData.css_class)
        .input("color_type", sql.VarChar, newData.color_type)
        .input("param_id", sql.VarChar, newData.param_id)
        .input("id_level", sql.Int, newData.id_level)
        .input("id", sql.Int, id)
        .query(sqlQuery);
    return result.rowsAffected[0];
};


// 函数：根据分页参数和查询条件获取字典数据记录system_dict_type
const queryPageRecords = async (
    pageN,
    pageS,
    name,
    type,
    status,
    create_time
) => {
    const offset = (pageN - 1) * pageS;
    const limit = pageS;

    let sqlQuery = `SELECT id,name,type,DATEADD(HOUR, -8, create_time) AS create_time,status,remark FROM system_dict_type WHERE deleted = 0`;
    let countSql = `SELECT COUNT(*) AS totalCount FROM system_dict_type WHERE deleted = 0`;
    const params = [];

    if (name) {
        sqlQuery += ` AND name LIKE '%${name}%'`;
        countSql += ` AND name LIKE '%${name}%'`;
    }

    if (type) {
        sqlQuery += ` AND type LIKE '%${type}%'`;
        countSql += ` AND type LIKE '%${type}%'`;
    }
    //添加status字段的条件，精确匹配
    if (status != undefined && status != null && status != "") {
        status = status === "开启" ? 0 : 1;
        sqlQuery += ` AND status = '${status}'`;
        countSql += ` AND status = '${status}'`;
    }
    if (create_time[0]) {
        sqlQuery += ` AND '${create_time[0]}'<=create_time AND'${create_time[1]}'>=create_time`;
        countSql += ` AND '${create_time[0]}'<=create_time AND'${create_time[1]}'>=create_time`;
    }

    sqlQuery += ` ORDER BY id DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;`;
    params.push(limit, offset);

    const pool = await sql.connect(config);

    // 执行数据库查询
    const result = await pool
        .request()
        .input("name", sql.VarChar, name)
        .input("type", sql.VarChar, type)
        .input("status", sql.Int, status)
        .input("startTime", sql.DateTime, create_time[0])
        .input("endTime", sql.DateTime, create_time[1])
        .input("offset", sql.Int, offset)
        .input("limit", sql.Int, limit)
        .query(sqlQuery);

    // 执行记录数量查询
    const countResult = await pool
        .request()
        .input("name", sql.VarChar, name)
        .input("type", sql.VarChar, type)
        .input("status", sql.Int, status)
        .input("startTime", sql.DateTime, create_time[0])
        .input("endTime", sql.DateTime, create_time[1])
        .query(countSql);

    const totalCount = countResult.recordset[0].totalCount;
    return { results: result.recordset, totalCount };
};



// 函数：根据分页参数和查询条件获取字典数据记录system_dict_data
const queryPageDict = async (pageN, pageS, name, label, status, type) => {
    const offset = (pageN - 1) * pageS;
    const limit = pageS;
    let sqlQuery = `SELECT id,label,value,sort,param_id,status,color_type,css_class,remark,id_level,DATEADD(HOUR, -8, create_time) AS create_time FROM system_dict_data WHERE deleted = 0 AND dict_type ='${type}'`;
    let countSql = `SELECT COUNT(*) AS totalCount FROM system_dict_data WHERE deleted = 0 AND dict_type ='${type}'`;
    let parentQuery = `SELECT * FROM system_dict_data WHERE deleted = 0 AND dict_type ='${type}' AND (id_level=1 OR id_level=2) ORDER BY id`;
    let allParentQuery = `SELECT * FROM system_dict_type WHERE deleted = 0`;
    const params = [];

    if (name) {
        sqlQuery += ` AND name = '${name}'`;
        countSql += ` AND name = '${name}'`;
    }

    if (label) {
        sqlQuery += ` AND label LIKE '%${label}%'`;
        countSql += ` AND label LIKE '%${label}%'`;
    }

    if (status != undefined && status != null && status != "") {
        status = status === "开启" ? 0 : 1;
        sqlQuery += ` AND status = '${status}'`;
        countSql += ` AND status = '${status}'`;
    }

    sqlQuery += ` ORDER BY sort DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;`;
    params.push(limit, offset);

    const pool = await sql.connect(config);

    // 执行数据库查询
    const result = await pool
        .request()
        .input("name", sql.VarChar, name)
        .input("label", sql.VarChar, label)
        .input("status", sql.Int, status)
        .input("offset", sql.Int, offset)
        .input("limit", sql.Int, limit)
        .query(sqlQuery);
    const parentResult = await pool
        .request()
        .input("offset", sql.Int, offset)
        .input("limit", sql.Int, limit)
        .query(parentQuery);
    const allParentResult = await pool
        .request()
        .input("name", sql.VarChar, name)
        .input("label", sql.VarChar, label)
        .input("status", sql.Int, status)
        .input("offset", sql.Int, offset)
        .input("limit", sql.Int, limit)
        .query(allParentQuery);
    // 执行记录数量查询
    const countResult = await pool
        .request()
        .input("name", sql.VarChar, name)
        .input("label", sql.VarChar, label)
        .input("status", sql.Int, status)
        .query(countSql);

    //查询子节点
    const totalCount = countResult.recordset[0].totalCount;
    return {
        results: result.recordset,
        totalCount,
        parentResult,
        allParentResult,
    };
};

module.exports = {deleteRecord,getRecordById,getRecordByIdDict,updateRecord,updateDict,queryPageRecords,queryPageDict};