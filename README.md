"# MinHash" 

Starting docker:

First you have to build the image: docker build -t ubuntu-node-app .

Starting docker without bash (not recommended) - just with the Scripts mentioned in package.json 
Starting docker with bash (staying bash and executing files) - "docker compose run --rm node bash" exit with exit, gets deleted automatically

Reactivating local ssh key:
eval "$(ssh-agent -s)" \
ssh-add ~/.ssh/sshkey




