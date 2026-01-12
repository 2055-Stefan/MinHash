"# MinHash" 
If wanting updates version of packages:
npm update (package-lock.json gets updated) 
add - commit - push the new updates package-lock.json
Starting docker:

First you have to build the image: docker build -t ubuntu-node-app .


If the Docker doesnt work well or hits you with "Modules not found" - then run "npm install"
Starting docker without bash (not recommended) - just with the Scripts mentioned in package.json 
Starting docker with bash (staying bash and executing files) - "docker compose run --rm node bash" exit with exit, gets deleted automatically

Reactivating local ssh key: \
eval "$(ssh-agent -s)" \
ssh-add ~/.ssh/sshkey


---

Comparison: MinHash vs. Jaccard If Node.js is installed, run the most precise measurement using:  
node --expose-gc measure.js

---

For more information regarding the testing process, please refer to:
HSH_Testprotokoll_v1.1.docx