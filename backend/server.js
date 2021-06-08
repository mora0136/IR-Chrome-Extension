const express = require('express'); //Handles the REST calls from the extension and chrome extension
const MongoClient = require('mongodb').MongoClient; //Database client
const ObjectID = require("mongodb").ObjectID // The datatype by which we can retrieve from the database a unique ID
var cors = require('cors'); //Policy that we apply to allow for access from web browsers.
const app = express();

// Web scraper that is able to get the raw text on the webpage
// https://www.npmjs.com/package/crawler-request
const crawler = require('crawler-request');

// We use request to get the html body of the website.
const request = require("request")

// JSSoup is a wrapper for the python equivelant soup library
// https://www.npmjs.com/package/jssoup
var JSSoup = require('jssoup').default;

// A Page Rank Library that uses nodes to
// https://www.npmjs.com/package/pagerank-js
const Pagerank = require("pagerank-js")

// The natural library
// https://www.npmjs.com/package/natural
const natural = require('natural');
const TfIdf = natural.TfIdf;
let TFIDF = new TfIdf() //this is for cross documents
tokenizer = new natural.WordTokenizer();
var classifier = new natural.BayesClassifier();

// LDA Library
const LDA = require('lda-topic-model');

// A Natural Language API in the cloud(Similar to SpaCy)
// https://www.npmjs.com/package/nlpcloud
// https://docs.nlpcloud.io/
const NLPCloudClient = require('nlpcloud');
const nlpCloudClient = new NLPCloudClient('en_core_web_lg','cead63ce03b0a877bcc8ba14a3ced16191e72850')

const databaseURL = 'mongodb://localhost:27017';

const dbName = 'myproject';
const client = new MongoClient(databaseURL);
// Use connect method to connect to the server
client.connect(async function(err) {
    console.log('Connected successfully to server');

    //Setting up a client
    const db = client.db(dbName);

    //boilerplate to enable web broswer communication with api
    app.use(cors())
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    app.get('/api/tabs', async function (req, res) {
        console.log("GET request on /api/tabs")
        const collection = db.collection('tabs')
        const result = await collection.find({}).toArray()
        for(let tab of result){
            hostname = new URL(tab.url).hostname
            tab.hostname = hostname
        }
        return res.status(200).send(result);
    });

    app.get('/api/tabs/byurl', async function (req, res) {
        console.log("GET request on /api/tabs")
        const collection = db.collection('tabs')
        const result = await collection.find({}).toArray()

        //group each of the tabs by the url hostname
        let listOfHostNames = {}
        let tab;
        for(tab of result){
            hostname = new URL(tab.url).hostname
            if(listOfHostNames[hostname]){
                listOfHostNames[hostname].push(tab)
            }else{
                listOfHostNames[hostname] = [tab]
            }
            tab.hostname = hostname
        }

        return res.status(200).send(listOfHostNames);
    });

    app.get('/api/tabs/bytitle', async function (req, res) {
        console.log("GET request on /api/tabs")
        const collection = db.collection('tabs')
        const result = await collection.find({}).toArray()

        //group each of the webpages by the term frequency of the document
        let tabs = {}
        for(let tab of result) {
            let resultOfTF = []
            let tfidf = new TfIdf(JSON.parse(tab.tfidf))

            // Tokenise and stem each word in the title of the tab
            rawText = tokenizer.tokenize(tab.title)
            tokAndStem = []
            for(word of rawText){
                console.log(word)
                tokAndStem.push(natural.PorterStemmer.stem(word))
            }

            // Find the frequency for each word from the title
            for (let word of tokAndStem){
                const freq = tfidf.tfidfs(word, function (i, measure) {
                    return measure
                });
                resultOfTF.push({word:word, freq:freq})
            }

            // Sort the results by highest to lowest frequency
            resultOfTF.sort((elm1, elm2)=> {return elm2.freq - elm1.freq})
            let mostFrequentWord = resultOfTF[0].word
            // Organise the tab with its most frequenct word
            // If the word already exists, add it to the group
            if(tabs[mostFrequentWord]){
                tabs[mostFrequentWord].push(tab)
            }else{
                tabs[mostFrequentWord] = [tab]
            }
        }

        return res.status(200).send(tabs);
    });

    app.get('/api/tabs/tfidf/search', async function (req, res) {
        console.log("GET request on /api/tabs/tfid/search")
        const collection = db.collection('tabs')
        const result = await collection.find({}).toArray()

        //Search all documents using tfidf

        rawText = tokenizer.tokenize(req.query.search)
        tokAndStem = []
        for(word of rawText){
            tokAndStem.push(natural.PorterStemmer.stem(word))
        }

        // The capitalised TFIDF contains all documents
        let tfidfSearchResult = []
        TFIDF.tfidfs(tokAndStem, function(i, measure) {
            if(measure != 0){
                result[i].measure = measure
                tfidfSearchResult.push(result[i])
            }
        })

        // Sort the results from most frequent to least
        let sorted = tfidfSearchResult.sort((elm1, elm2)=> elm2.measure - elm1.measure)
        console.log(sorted)

        res.status(200).send(sorted)
    });
    app.get('/api/tabs/bytitletopic', async function (req, res) {
        console.log("GET request on /api/tabs/bytopic")
        const collection = db.collection('tabs')
        const result = await collection.find({}).toArray()
        let tabs = {}

        const options = {
            displayingStopwords: false,
            language: 'en',
            numberTopics: 6, //The number of topics to match with
            sweeps: 1000, //The number of recurrences it should undertake
            stem: true,
        };

        // Form the data into the structure that the LDA method will accept
        // We are using the title of the tab to represent the tab
        ldaData = []
        for(tab of result){
            ldaData.push({id: result.indexOf(tab), text: tab.title})
        }

        //Calculate the LDA results
        const lda = new LDA(options, ldaData);
        let documentResult = lda.getDocuments()

        for(let topic of documentResult){
            let topicIdentifier = topic.documentVocab[0].word //arbitrarily choose first as best to represent topic
            for(let doc of topic.documents){ //Go through all the documents that have been associated with the topic
                if(doc.score > 0.2){ // filter out documents that did not have strong connection to topic
                    if(tabs[topicIdentifier]){
                        tabs[topicIdentifier].push(result[doc.id])
                    }else{
                        tabs[topicIdentifier] = [result[doc.id]]
                    }
                }

            }
        }

        return res.status(200).send(tabs);
    });

    app.get('/api/tabs/bytopic', async function (req, res) {
        console.log("GET request on /api/tabs/bytopic")
        const collection = db.collection('tabs')
        const result = await collection.find({}).toArray()
        let tabs = {}

        const options = {
            displayingStopwords: false,
            language: 'en',
            numberTopics: 6, //The number of topics to match with
            sweeps: 1000, //The number of recurrences it should undertake
            stem: true,
        };

        // Form the data into the structure that the LDA method will accept
        // We are using the body text of the tab to represent the tab
        ldaData = []
        for(let tab of result){
            ldaData.push({id: result.indexOf(tab), text: tab.rawText})
        }

        //Calculate the LDA results
        const lda = new LDA(options, ldaData);
        let documentResult = lda.getDocuments()

        for(let topic of documentResult){
            let topicIdentifier = topic.documentVocab[0].word //arbitrarily choose first as best to represent topic
            for(let doc of topic.documents){ //Go through all the documents that have been associated with the topic
                if(doc.score > 0.2){ // filter out documents that did not have strong connection to topic
                    if(tabs[topicIdentifier]){
                        tabs[topicIdentifier].push(result[doc.id])
                    }else{
                        tabs[topicIdentifier] = [result[doc.id]]
                    }
                }

            }
        }

        return res.status(200).send(tabs);
    });

    app.get('/api/tab/:id', async function (req, res) {
        console.log("GET request on /api/tabs/"+req.params.id)
        // Get the documents collection
        const collection = db.collection('tabs');
        // Find some documents
        const result = await collection.find({_id: ObjectID.createFromHexString(req.params.id)}).toArray();
        res.status(200).send(result[0]);
    });

    app.get('/api/tab-detail/:id', async function (req, res) {
        console.log("GET request on /api/tab-detail/"+req.params.id)
        // Get the documents collection
        const collection = db.collection('tabs');
        // Find some documents
        const result = await collection.find({_id: ObjectID.createFromHexString(req.params.id)}).toArray();

        console.log(result[0].rawText)

        // We will use this api to get a result containing the raw text with all named entities
        const response = await nlpCloudClient.entities(result[0].rawText)
            .catch(function (err) {
                console.error(err.response.status);
                console.error(err.response.data.detail);
            });
        let listOfIdentifiedPeopleEntities = []
        let listOfIdentifiesDateEntities = []


        // We are using this data to find the potential date and author of the document
        for(let data of response.data.entities){
            if(data.type == "PERSON"){
                listOfIdentifiedPeopleEntities.push(data)
            }else if((data.type == "DATE")){
                listOfIdentifiesDateEntities.push(data)
            }
        }

        // This will be used to record the current shortest distance between a person and a date
        let shortestDistance = {
            person: undefined,
            date: undefined,
            difference: 1000
        }

        // a matrix of person and date, where we record the shortest occured distance between them.
        for(let person of listOfIdentifiedPeopleEntities){
            for(let date of listOfIdentifiesDateEntities){
                let difference = Math.abs(person.end - date.start)
                if(difference < shortestDistance.difference){
                    shortestDistance ={
                        person: person,
                        date: date,
                        difference: difference,
                    }
                }
            }
        }

        // This is unrelated to our author identification. This is to search for possible related sites by looking at
        // all the links on the page and doing a PageRank on all of them. It doesn't really work
        await recursiveSearch(result[0].url, 0, result[0].id)
        // we now have our map
        let linkProb = 0.85 //high numbers are more stable
        let tolerance = 0.000001 //sensitivity for accuracy of convergence.
        let nodes = []

        // related Sites contains the resurlts of the recursive search. It is a list of website with identifiers,
        // and where the link originated from(parentId)
        let sortedById = relatedSites.sort((elm1, elm2)=>{
            return elm1.id < elm2.id
        })

        // Form the parentId of each site into the appropriate data.
        for(let site of sortedById){
            nodes.push(site.parentId)
        }

        // Do the pagerank
        await Pagerank(nodes, linkProb, tolerance, function (err, res) {
            if (err) throw new Error(err)
            for(let site of relatedSites){
                site.pageRank = res[site.id]
                console.log(site)
            }
        })

        //Sort the sites by their pagrank
        let sortedByRank = relatedSites.sort((elm1, elm2)=>{
            return elm1.pageRank > elm2.pageRank
        })

        // We will use this to append the urls associated with the tab, sorted by pagerank
        shortestDistance.nearestPage = []

        //We only want the top 4 highest results
        for(let j=0; j<4; j++){
            shortestDistance.nearestPage.push(sortedByRank[j])
        }

        res.status(200).send(shortestDistance)
    });



    app.post('/api/tab', async function (req, res) {
        console.log("POST request on /api/tab/")
        const collection = db.collection('tabs');

        // Initialise the start position
        req.body.x = 0
        req.body.y = 0

        // Find the text contained on the website
        console.log("The request URL is "+ req.body.url)
        rawText = await crawler(req.body.url).then(function(response){
            return response.text
        })
        if(rawText){
            req.body.rawText = rawText

            //get the term frequency of body, the function is called tfidf, but since we only insert one document, it is just a term frequency
            let tfidf = new TfIdf()
            rawTokenized = tokenizer.tokenize(rawText)
            tokAndStem = ""
            for(let word of rawTokenized){
                tokAndStem+=" "+natural.PorterStemmer.stem(word)
            }

            tfidf.addDocument(tokAndStem) //Term frequency document
            TFIDF.addDocument(tokAndStem) //Term frequency inverse document

            req.body.tfidf = JSON.stringify(tfidf)
        }else{
            req.body.tfidf = null
            req.body.rawText = ''
        }

        // insert into the database for later retrieval
        collection.insertOne(req.body, function(err, result) {
            console.log('Inserted tab: '+req.body.title);
        });

        return res.send('Hello world');
    });

    app.put('/api/tab/:id', async function (req, res) {
        console.log("PUT request on /api/tab/"+req.params.id)

        //If the url has changed, then we can assume a new document needs to be added
        if(req.body.url){
            rawText = await crawler(req.body.url).then(function(response){
                return response.text
            })
            if(rawText){
                req.body.rawText = rawText

                //get the term frequency of body
                let tfidf = new TfIdf()
                rawTokenized = tokenizer.tokenize(rawText)
                tokAndStem = ""
                for(let word of rawTokenized){
                    tokAndStem+=" "+natural.PorterStemmer.stem(word)
                }

                tfidf.addDocument(tokAndStem) //Term frequency document
                TFIDF.addDocument(tokAndStem) //Term frequency inverse document

                req.body.tfidf = JSON.stringify(tfidf)
            }else{
                req.body.tfidf = null
                req.body.rawText = ''
            }
        }

        // Get the documents collection
        const collection = db.collection('tabs');
        // Insert some documents
        const updateDoc = {
            $set: req.body
        };
        const result = await collection.updateOne({id: parseInt(req.params.id)}, updateDoc)
        if(result.result.n === 0){
            //assume that it is a new request
            return res.status(400).send(result.result)
        }
        return res.send();
    });

    app.delete('/api/tab/:id', async function (req, res) {
        console.log("DELETE request on /api/tab/"+req.params.id)
        const collection = db.collection('tabs');
        const result = await collection.deleteOne({id: parseInt(req.params.id)})
        return res.send('Hello world');
    });

    app.delete('/api/allTabs', async function (req, res) {
        console.log("DELETE request on /api/allTabs/")
        const collection = db.collection('tabs');
        try{
            await collection.drop()
            classifier = new natural.BayesClassifier();
            TFIDF = new TfIdf() //this is for cross documents
        }catch(e){

        }
        return res.send('Hello world');
    });

    app.listen(process.env.PORT || 8088);
    // client.close();
});


var i = 0;
var id = 0;
let relatedSites = []

recursiveSearch = function(url, currentLoop, parentId){
    console.log("start of new recursion")
    return new Promise((resolve,reject)=>{
        request(url, async function (error, response, body) {
            // Find all the text on the website
            var soup = new JSSoup(body);
            let findAllResult = soup.findAll('a')
            // find all the links from the website
            let baseUrl = new URL(url).hostname
            for (const link of findAllResult) {
                if (link.attrs) {
                    if (link.attrs.href) {
                        if (!link.attrs.href.includes("http") || link.attrs.href.includes(baseUrl)) { //|| link.attrs.href.includes(baseUrl)
                            // console.log("skipping"+ link.attrs.href)
                            continue; //skip internal links
                        }

                        // We need to identify if the site has already been visited.
                        // If it has, then just add that we found a new link to the deocument (parentId)
                        // else, add it as a new site
                        const result = relatedSites.find(element => element.url == link.attrs.href)
                        if (result) {
                            relatedSites[relatedSites.indexOf(result)].parentId.push(id)
                        } else {
                            id++
                            relatedSites.push({id: id, url: link.attrs.href, parentId: [parentId]})
                        }

                        //then do a recursive search on it
                        currentLoop++
                        if (currentLoop >= 5) { //how many websites deep do we want to go?
                            resolve()
                            continue;
                        }
                        await recursiveSearch(link.attrs.href, currentLoop, id)
                    }
                }
            }
            resolve()
        })
    })
}