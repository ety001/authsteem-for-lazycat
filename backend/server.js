const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

// 创建 Express 应用
const app = express();
app.use(bodyParser.json());

// 创建或连接到 SQLite 数据库
const db = new sqlite3.Database('/app/db/authsteem.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the authsteem database.');
    // 创建用户表
    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                encrypted_password TEXT NOT NULL
            )
        `);
    });
});

// 处理添加用户的请求
app.post('/addUser', (req, res) => {
    const { username, encryptedPassword } = req.body;
    const sql = 'INSERT INTO users (username, encrypted_password) VALUES (?,?)';
    db.run(sql, [username, encryptedPassword], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({
            message: 'User added successfully',
            id: this.lastID
        });
    });
});

// 获取所有用户
app.get('/getAllUsers', (req, res) => {
    const sql = 'SELECT * FROM users';
    db.get(sql, [], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ users: rows });
    });
});

// 处理检查用户是否存在的请求
app.get('/hasUser/:username', (req, res) => {
    const username = req.params.username;
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.get(sql, [username], (err, row) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ hasUser: !!row });
    });
});

// 处理删除用户的请求
app.delete('/removeUser/:username', (req, res) => {
    const username = req.params.username;
    const sql = 'DELETE FROM users WHERE username = ?';
    db.run(sql, [username], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({
            message: 'User removed successfully',
            changes: this.changes
        });
    });
});

// 启动服务器
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});