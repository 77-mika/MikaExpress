import http from "http";

export class App {
    listen(port: number) {
        //create a server
        const server = http.createServer((req, res) => {
            console.log(`someone Requested : ${req.url}`);

            //respond with :
            //mikaexpress is running
            res.writeHead(200, { "Content-Type": "text/plain" });
            res.write("Mikaexpress is running");
            res.end();
        });
        //start listening
        server.listen(port,()=>{
            //log a mesassage
            console.log(`Server is Listening on http://localhost:${port}`)
        })

        
    }
}
