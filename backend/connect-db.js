const util = require('util');
const MongoClient = require('mongodb').MongoClient;

const DB_RS = null;
const DB_NAME = 'crypto-cert-db'

const DB_HOSTS = [
    process.env.DB_HOSTS
]

const DB_USER  = process.env.DB_USER
const DB_PASS  = process.env.DB_PASS
const CACERT   = '/home/tripleheaven/.mongodb/root.crt'

const url = util.format('mongodb://%s:%s@%s/', DB_USER, DB_PASS, DB_HOSTS.join(','))

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    tls: true,
    tlsCAFile: CACERT,
    replicaSet: DB_RS,
    authSource: DB_NAME
}


const mongoClient = MongoClient.connect(url, options, function(err, conn) {
    console.log('=====!', err)

    if (conn.isConnected()) {
        const db = conn.db(DB_NAME)
        console.log(db.databaseName)
    }

    conn.close()
})




module.exports = {
    mongoClient
}