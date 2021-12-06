const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

class PFnode{
    constructor(parent, x, y){
        this.parent = parent;
        this.x = x;
        this.y = y;
        this.g;
        this.h;
        this.f;
        this.index = getIndexofCoord(x, y);
        this.state = null;
    }

    getDistanceToNode(target_node){
        return Math.sqrt((target_node.x - this.x) ** 2 + (target_node.y - this.y) ** 2);
    };
}

class Path{
    constructor(starting_point, destination, path){
        this.startPoint = starting_point;
        this.destination = destination;
        this.path = path;
    }
}

let map = [ 1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
            1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
            1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
            1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
            1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
            1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
            1,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,1,
            1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,
            1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,
            1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,
            1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,
            1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,
            1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,
            1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,
            1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,1,
            1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
            1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
            1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
            1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
            1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
let mapDim = [20,20];
let tileWidth = 32;
let colorTab=['white', 'black', '#cc0000', 'purple', '#ffee99'];
canvas.width = mapDim[0]*tileWidth;
canvas.height = mapDim[1]*tileWidth;

var startPoint=getIndexofCoord(1*tileWidth, 1*tileWidth);
var endPoint=getIndexofCoord(3*tileWidth, 4*tileWidth);

function getIndexofCoord(x, y){
    return Math.floor(x/tileWidth)+Math.floor(y/tileWidth)*mapDim[0];
}

function drawMap(){
    ctx.strokeStyle = 'grey';
    for(var y=0;y<mapDim[1];y++){
        for(var x=0;x<mapDim[0];x++){
            switch(x+y*mapDim[0]){
            case startPoint:
                ctx.fillStyle = colorTab[2];
                break;
            case endPoint:
                ctx.fillStyle = colorTab[3];
                break;
            default:
                ctx.fillStyle = colorTab[map[x+y*mapDim[0]]];
            }
            ctx.fillRect(x*tileWidth, y*tileWidth, tileWidth, tileWidth);
            ctx.strokeRect(x*tileWidth, y*tileWidth, tileWidth, tileWidth);
        }
    }
}

function setStartPoint(x, y){
    startPoint = getIndexofCoord(x, y);
}

function setEndPoint(x, y){
    endPoint = getIndexofCoord(x, y);
}

function findPath(map, startPoint, endPoint, lowest_walkable_value = 0){
    var timeTaken = Date.now();
    var path = [];
    //on crée une copie de la carte pour pouvoir la massacrer en paix
    var dummyMap = [];
    map.forEach((e, i)=>{
        if(e <= lowest_walkable_value)
            dummyMap.push(new PFnode(null, (i%mapDim[0])*tileWidth, Math.floor(i/mapDim[0])*tileWidth));
        else
            dummyMap.push(e);
    });
    // on initialise la case de départ
    dummyMap[startPoint].g = 0;
    dummyMap[startPoint].h = dummyMap[startPoint].getDistanceToNode(dummyMap[endPoint]);
    dummyMap[startPoint].f = dummyMap[startPoint].g + dummyMap[startPoint].h;

    // listes des cases à visiter (open) et des cases déjà visités (close)
    var openList = [startPoint];
    var closeList = [];

    // index de la case que l'on visite actuellement
    let currentNode;

    var pathFound = false;

    while(openList.length>0){
        currentNode = openList[0];
        // console.log(currentNode, endPoint);

        if(currentNode == endPoint){
            pathFound = true;
            break;
        }

        for(let y=-1;y<2;y++){
            for(let x=-1;x<2;x++){
                foundNode = getIndexofCoord(dummyMap[currentNode].x+x*tileWidth, dummyMap[currentNode].y+y*tileWidth);

                let blockedDiagonal = false;
                switch(true){ // assure que l'on contourne bien les murs
                case (x==-1 && y==-1):
                    blockedDiagonal = (!isNaN(dummyMap[getIndexofCoord(dummyMap[currentNode].x+(x+1)*tileWidth, dummyMap[currentNode].y+y*tileWidth)])||!isNaN(dummyMap[getIndexofCoord(dummyMap[currentNode].x+x*tileWidth, dummyMap[currentNode].y+(y+1)*tileWidth)]));
                    break;
                case (x==1 && y==-1):
                    blockedDiagonal = (!isNaN(dummyMap[getIndexofCoord(dummyMap[currentNode].x+(x-1)*tileWidth, dummyMap[currentNode].y+y*tileWidth)])||!isNaN(dummyMap[getIndexofCoord(dummyMap[currentNode].x+x*tileWidth, dummyMap[currentNode].y+(y+1)*tileWidth)]));
                    break;
                case (x==-1 && y==1):
                    blockedDiagonal = (!isNaN(dummyMap[getIndexofCoord(dummyMap[currentNode].x+(x+1)*tileWidth, dummyMap[currentNode].y+y*tileWidth)])||!isNaN(dummyMap[getIndexofCoord(dummyMap[currentNode].x+x*tileWidth, dummyMap[currentNode].y+(y-1)*tileWidth)]));
                    break;
                case (x==1 && y==1):
                    blockedDiagonal = (!isNaN(dummyMap[getIndexofCoord(dummyMap[currentNode].x+(x-1)*tileWidth, dummyMap[currentNode].y+y*tileWidth)])||!isNaN(dummyMap[getIndexofCoord(dummyMap[currentNode].x+x*tileWidth, dummyMap[currentNode].y+(y-1)*tileWidth)]));
                    break;
                }

                // console.log(foundNode);
                if(isNaN(dummyMap[foundNode]) && !(x==0 && y==0) && !blockedDiagonal){
                    // console.log('IsNaN');
                    if(dummyMap[foundNode].state == null){
                        openList.push(foundNode);
                        dummyMap[foundNode].parent = dummyMap[currentNode];
                        dummyMap[foundNode].g = dummyMap[currentNode].g+dummyMap[currentNode].getDistanceToNode(dummyMap[foundNode]);
                        dummyMap[foundNode].h = dummyMap[foundNode].getDistanceToNode(dummyMap[endPoint]);
                        dummyMap[foundNode].f = dummyMap[foundNode].g+dummyMap[foundNode].h;
                        dummyMap[foundNode].state = 'open';
                        // console.log('added', dummyMap[foundNode].g, dummyMap[foundNode].h, dummyMap[foundNode].f);
                    }
                    else if(dummyMap[foundNode].state =='open' && dummyMap[foundNode].g>dummyMap[currentNode].g+dummyMap[currentNode].getDistanceToNode(dummyMap[foundNode])){
                        // console.log('update');
                        dummyMap[foundNode].parent = dummyMap[currentNode];
                        dummyMap[foundNode].g = dummyMap[currentNode].g+dummyMap[currentNode].getDistanceToNode(dummyMap[foundNode]);
                        dummyMap[foundNode].f = dummyMap[foundNode].g+dummyMap[foundNode].h;
                    }
                    else if(dummyMap[foundNode].state =='closed' && dummyMap[foundNode].g>dummyMap[currentNode].g+dummyMap[foundNode].getDistanceToNode(dummyMap[currentNode])){
                        // console.log('réouverture');
                        dummyMap[foundNode].state = 'open';
                        dummyMap[foundNode].g = dummyMap[currentNode].g+dummyMap[currentNode].getDistanceToNode(dummyMap[foundNode]);
                        dummyMap[foundNode].f = dummyMap[foundNode].g+dummyMap[foundNode].h;
                        openList.push(closeList.splice(closeList.indexOf(foundNode), 1));
                    }
                }
            }
        }

        dummyMap[currentNode].state = 'closed';
        closeList.push(openList.splice(0,1));
        openList.sort((a, b)=>{
            return dummyMap[a].f - dummyMap[b].f;
        })
    }
    if(pathFound){
        path.push(currentNode);
        while(dummyMap[currentNode].parent != null){
            currentNode = getIndexofCoord(dummyMap[currentNode].parent.x, dummyMap[currentNode].parent.y);
            path.push(currentNode);
        }
        console.log('Search time: '+Number(Date.now()-timeTaken)+' ms');
        return new Path(startPoint, endPoint, path);
    }
    else{
        console.log('Search time: '+Number(Date.now()-timeTaken)+' ms');
        return null;
    }
}

function tracePath(){ // fait changer de couleur les cases renvoyées par la fonction findPath()
    var path = findPath(map, startPoint, endPoint, 0).path;
    drawMap();
    if(path!=null){
        ctx.fillStyle = colorTab[4];
        ctx.strokeStyle = 'grey';
        path.forEach((e,i)=>{
            if(i!=0 && i!=path.length-1){
                ctx.fillRect((e%mapDim[0])*tileWidth, Math.floor(e/mapDim[0])*tileWidth, tileWidth, tileWidth);
                ctx.strokeRect((e%mapDim[0])*tileWidth, Math.floor(e/mapDim[0])*tileWidth, tileWidth, tileWidth);
            }
        });
    }
}

drawMap();

canvas.addEventListener('click', (e)=>{
    var mouseX = e.clientX - canvas.getBoundingClientRect().left;
    var mouseY = e.clientY - canvas.getBoundingClientRect().top;

    startPoint = getIndexofCoord(mouseX, mouseY);
    tracePath();
});

canvas.addEventListener('contextmenu', (e)=>{
    e.preventDefault();
    
    var mouseX = e.clientX - canvas.getBoundingClientRect().left;
    var mouseY = e.clientY - canvas.getBoundingClientRect().top;

    endPoint = getIndexofCoord(mouseX, mouseY);
    tracePath();
});