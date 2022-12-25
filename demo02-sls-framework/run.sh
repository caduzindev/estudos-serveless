# Instalar
npm i -g serveless

# sls inicializado
sls

# sempre fazer o deploy antes de tudo para verificar se está ok
sls deploy

# invoke na aws
sls invoke -f hello

# invoke local
sls invoke local -f hello -l

# dashboard
sls

# logs
sls logs -f hello -t

# remove
sls remove