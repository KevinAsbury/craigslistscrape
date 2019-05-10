const cheerio = require("cheerio")
const request = require("request-promise")

const url = "https://louisville.craigslist.org/d/transportation/search/trp"

const scrapeResults = []

async function scrapeJobHeader() {
    try {
        const html = await request.get(url)
        const $ = await cheerio.load(html)
        
        $(".result-info").each((_, element) => 
        { 
            const resultTitle = $(element).children(".result-title")
            const title = resultTitle.text().trim()
            const url = resultTitle.attr("href");
            const datePosted = new Date(
                $(element)
                .children("time")
                .attr("datetime")
            ) 
            const hood = $(element)
                .find(".result-hood")
                .text()
                .replace("(", "")
                .replace(")", "")
                .trim()
            const scrapeResult = { title, hood, url, datePosted}
            scrapeResults.push(scrapeResult)            
        })

        return scrapeResults
    } catch (err) {
        console.error(err)
    }
    
}

async function scrapeDescriptions(jobsWithHeaders){
    try {
        return await Promise.all(
            jobsWithHeaders.map(async job => {
                const htmlResult = await request.get(job.url)
                const $ = await cheerio.load(htmlResult)
    
                $('.print-qrcode-container').remove()
    
                job.description = $("#postingbody")
                    .text()
                    .replace("_", "")
                    .replace(/\n/g, " ")
                    .replace(/\t/g, " ")
                    .replace("    ", " ")
                    .replace("   ", " ")
                    .replace("  ", " ")
                    .trim()
                job.address = $("div.mapaddress")
                    .text()
                    .trim()
                job.wage = $(".attrgroup")
                    .children()
                    .first()
                    .text()
                    .replace("compensation:", "")
                    .trim()
                job.hours = $(".attrgroup")
                    .children()
                    .next()
                    .text()
                    .replace("employment type:", "")
                    .trim()
    
                return job
            })
        )
    } catch (err) {
        console.error(err)
    }
}

async function scrapeCraigslist() {
    const jobsWithHeaders = await scrapeJobHeader();
    const jobsFullData = await scrapeDescriptions(jobsWithHeaders)
    console.log(jobsFullData.length)
    // console.log(jobsFullData.length)
}

scrapeCraigslist()