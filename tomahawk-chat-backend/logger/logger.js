const config = require("../config.js"),
    MongoClient = require('mongodb').MongoClient,
    winston = require('winston');

const { format, transports } = winston;
const { combine, timestamp, label, printf } = format;

require('winston-mongodb');

var container = new winston.Container();

var uri = `mongodb://${config.LoggerConfig.host}:${config.LoggerConfig.port}/${config.LoggerConfig.dbname}`;

var myFormat = printf(info => { return info.message });

container.add('ws', {
    level: 'debug',
    transports: [
        new transports.MongoDB({
            'format': myFormat,
            //'level': 'debug',        // Level of messages that this transport should log, defaults to 'info'.
            //'silent': true,          // Boolean flag indicating whether to suppress output, defaults to false.
            'capped': true, // In case this property is true, winston-mongodb will try to create new log collection as capped, defaults to false.
            //'cappedSize': 10000000,  // Size of logs capped collection in bytes, defaults to 10000000.
            //cappedMax:               // Size of logs capped collection in number of documents.
            'label': 'ws', // Label stored with entry object if defined.
            'db': uri,
            'collection': config.LoggerConfig.collection // The name of the collection you want to store log messages in, defaults to 'log'.
        })
    ]
});

container.add('file', {
    level: 'debug',
    transports: [
        new transports.MongoDB({
            'format': myFormat,
            'capped': true,
            'label': 'file',
            'db': uri,
            'collection': config.LoggerConfig.collection
        })
    ]
});

container.add('token', {
    level: 'debug',
    transports: [
        new transports.MongoDB({
            'format': myFormat,
            'capped': true,
            'label': 'token',
            'db': uri,
            'collection': config.LoggerConfig.collection
        })
    ]
});

container.add('crypto', {
    level: 'debug',
    transports: [
        new transports.MongoDB({
            'format': myFormat,
            'capped': true,
            'label': 'crypto',
            'db': uri,
            'collection': config.LoggerConfig.collection
        })
    ]
});

if (process.env.NODE_ENV !== 'production') {

    function getTransport(tag) {
        return new transports.Console({
            'format': combine(
                label({ label: tag }),
                timestamp(),
                printf(info => {
                    return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
                })
            ),
            //'colorize': true,
            'timestamp': true
        });
    }

    container.get('ws').add(getTransport('ws'));
    container.get('file').add(getTransport('file'));
    container.get('token').add(getTransport('token'));
    container.get('crypto').add(getTransport('crypto'));
}

module.exports = container;

//logger.info('message with meta data', {'meta': {'user': 'admin'}});

/*0: error (ошибка)
1: warn (предупреждение)
2: info (информация)
3: verbose (расширенный вывод)
4: debug (отладочное сообщение)
5: silly (простое сообщение)*/