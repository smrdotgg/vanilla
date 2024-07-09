docker run -d -p 53:53 -p 53:53/udp --name pdns-master \
  --hostname dns.trysplitbox.com \
  -e PDNS_master=yes \
  -e PDNS_api=yes \
  -e PDNS_api_key=secret \
  -e PDNS_webserver=yes \
  -e PDNS_webserver_address=0.0.0.0 \
  -e PDNS_webserver_password=secret2 \
  -e PDNS_version_string=anonymous \
  -e PDNS_default_ttl=1500 \
  -e PDNS_allow_axfr_ips=172.5.0.21 \
  -e PDNS_only_notify=172.5.0.21 \
  pschiffe/pdns-mysql

# DATABASE_URL='mysql://r5690cs187x3183dasp2:pscale_pw_WE34hbK3NOJdT94hCgiNu5qCYLmeVZoxqFCVaujLbKC@aws.connect.psdb.cloud/splitbox?sslaccept=strict'
# edit this to have the following..
#
# it should work



