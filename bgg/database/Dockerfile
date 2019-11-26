FROM mysql@sha256:bf17a7109057494c45fba5aab7fc805ca00ac1eef638dfdd42b38d5a7190c9bb

ENV MYSQL_ROOT_PASSWORD=changeit MYSQL_DATABASE=bgg 

ADD bgg.sql /docker-entrypoint-initdb.d

HEALTHCHECK --interval=60s --timeout=30s \
	CMD mysqladmin ping -uroot -p${MYSQL_ROOT_PASSWORD} --silent || exit 1

EXPOSE 3306

VOLUME /var/lib/mysql
