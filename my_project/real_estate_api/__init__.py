import pymysql

# Django's MySQL backend checks mysqlclient version; PyMySQL reports an older version.
pymysql.version_info = (2, 2, 1, "final", 0)
pymysql.install_as_MySQLdb()
