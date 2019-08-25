class Game{
    constructor(){
        this.rows = 6;
        this.cols  = 7;
        this.player = 0; //0 human
        this.totalMove  = this.rows*this.cols;
        this.moveCount = 0;
        this.gameover = false;
        this.gameField = this.initialize();
        this.humanScore = -100000;
        this.computerScore = 100000;
        this.depth = 6;
        this.winning_array = [];
        this.date = new Date();
        this.handleEvents();
       
    }

    initialize(){
        $(".row .col").addClass("empty");
        $("i").html("Your turn");

        let board = new Array(this.rows);
        for(let i=0; i<this.rows; i++){
            board[i] = new Array(this.cols);
            for(let j = 0; j<this.cols; j++){
                board[i][j] = null;
            }
        }
        return board;
      
    }

    handleEvents(){

        
        const that = this;

        function humanTurn($cell){
            $cell.addClass("human");
            $cell.removeClass("empty");
            
        }
        $(".btn_restart").on("click", function(){
            location.reload(true); 
            alert('Reload to Play Agin?');
        })
        if(!that.gameover) {
            $("div.col.empty").on("mouseenter",  function(){
                let colIndex = $(this).attr("c-index");
                $(`[c-index=${colIndex}]`).addClass("selectedCol");
                
            });
            $("div.col.empty").on("mouseleave",   function(){
                $(".selectedCol").removeClass("selectedCol");
                
            });
            $("div.col.empty").on("click",  function(){
                if(that.player === 0){
                    
                    let colIndex = $(this).attr("c-index");
                    let rowIndex = 0;
                    let isPossible = false;

                    for(let i=0; i<that.rows; i++){
                        let $cell = $(`[c-index=${colIndex}][r-index=${i}]`);

                        if($cell.hasClass("empty")){
                            rowIndex = i;
                            humanTurn($cell);  
                            isPossible = true; 
                            break;
                        }
                    }
                    if(!isPossible) return;
                    that.moveCount++;
                    that.switchTurn(rowIndex,colIndex);
                    if(that.chekWin(that.gameField)===that.humanScore){
                        setTimeout(function(){ alert("You Won"); },100);
                        $("i").html("You Won");
                        that.gameover = true;
                        $(".btn_restart").show();
                        that.showWinning();
                    
                    }
                    else if(that.isDraw()){
                        setTimeout(function(){ alert("Match Tie"); },0.1);
                        $("i").html("Match Tie");
                        that.gameover = true;
                        $(".btn_restart").show();
                    }
                    else{
                        if(!that.gameover){
                            $("i").html("Computer Thinking...");
                            let t = 0;
                            setTimeout(function(){
                                that.computerTurn();
                            }, 1);
                           
                        }

                    } 
                    
                }
                
                
            });
        }
    }
    switchTurn(r,c){
        if(this.player === 0){
            this.gameField[r][c] = 0;
            this.player = 1;
            

        }
        else{
            this.player = 0;
            $("i").html("Your turn");
            this.gameField[r][c] = 1;
        }

    }

    computerTurn(){

        let clonedField = this.clone(this.gameField);
        clonedField.player = this.player;
        let index = this.getComputerMove(clonedField);
        $(`[r-index=${index.row}][c-index=${index.col}]`).addClass("computer");
        $(`[r-index=${index.row}][c-index=${index.col}]`).removeClass("empty");
        

        this.moveCount++;
        this.switchTurn(index.row,index.col);
        if(this.chekWin(this.gameField)===this.computerScore){
            setTimeout(function(){ alert("You Lost"); },100);
            $("i").html("You Lost");
            $("div.col.empty").removeClass("empty");
            this.player = 1;
            this.gameover = true;
            $(".btn_restart").show();
            this.showWinning();
            
        }
        else if(this.isDraw()){
            setTimeout(function(){ alert("Match Tie"); },0.1);
            $("i").html("Match Tie");
            this.gameover = true;
            $(".btn_restart").show();
        }
        $(`[r-index=${index.row}][c-index=${index.col}]`).addClass("lastMove");
        setTimeout(function(){
            $(`[r-index=${index.row}][c-index=${index.col}]`).removeClass("lastMove");
        },800)
        
    }

    

    isDraw(){
        if(this.moveCount === this.totalMove) return true;
        else return false;
    }

    clone(gameField){
        let c = 0;
        let board = new Array(this.rows);
        for(let i=0; i<this.rows; i++){
            board[i] = new Array(this.cols);
            for(let j = 0; j<this.cols; j++){
                board[i][j] = gameField[i][j];
                if(board[i][j]!=null) c++;
            }
        }
        let field = {
            board : board,
            moveCount : c,
            player : null
        };
        return field;
    }

    getComputerMove(field){
        let aiMove = this.maximizedTurn(field, this.depth, -99999,99999);
        let col = aiMove.c_index;
        let row = this.giveMove(field, col);
        let index = {
            row:row,
            col:col
        };
        return index;
    }

    maximizedTurn(field, depth, alpha, beta){

        const that = this;

        let evalValue =  that.evaluate(field.board);

        if(that.isFinished(field, depth, evalValue)){
            let returnValue = {
                c_index : null,
                value : evalValue
            };
            return returnValue;
        }

        let max = {
            c_index : null,
            value : -99999
        };

        for(let col = 0; col < that.cols; col++){

            let new_field = that.clone(field.board);
            new_field.player = field.player;
            if(that.isPossibleMove(new_field, col)){
                let rowIndex = that.giveMove(new_field, col);

                let next = that.minimizedTurn(new_field, depth-1, alpha, beta);

                if(next.c_index == null || next.value > max.value){
                    
                    max.c_index = col;
                    max.value = next.value;
                    alpha = next.value;
                }

                if (alpha >= beta) return max;

            }
        }
        if(max.c_index==null){
            for(let i=0; i<this.cols; i++){
                if(this.isPossibleMove(field,i)){
                    max.c_index = i;
                    break;
                }
            }
        }
        
        return max;


    }


    minimizedTurn(field, depth, alpha, beta){

        const that = this;

        let evalValue =  that.evaluate(field.board);

        if(that.isFinished(field, depth, evalValue)){
            let returnValue = {
                c_index : null,
                value : evalValue
            };
            return returnValue;
        }

        let min = {
            c_index : null,
            value : 99999
        };

        for(let col = 0; col < that.cols; col++){

            let new_field = that.clone(field.board);
            new_field.player = field.player;
            if(that.isPossibleMove(new_field, col)){
                let rowIndex = that.giveMove(new_field, col);

                let next = that.maximizedTurn(new_field, depth-1, alpha, beta);
                if(next.c_index == null || next.value < min.value){
                    
                    min.c_index = col;
                    min.value = next.value;
                    beta = next.value;
                }

                if (alpha >= beta) return min;

            }
        }
        if(min.c_index==null){
            for(let i=0; i<this.cols; i++){
                if(this.isPossibleMove(field,i)){
                    min.c_index = i;
                    break;
                }
            }
        }
        
        return min;

    }

    giveMove(field, col){
        let body = field.board;
        let rVal;
        for(let r = 0; r < this.rows; r++){
            if(body[r][col]==null) {
                body[r][col] = field.player;
                rVal = r;
                break;
            }
        }
        if(field.player === 0) field.player = 1;
        else field.player = 0; 

        return rVal;

    }

    isPossibleMove(field, col){
        if(field.board[this.rows-1][col] == null && col>=0 && col<this.cols) return true;
        else return false;
    }

    isFinished(field, depth, evalValue){
        if(field.moveCount === this.totalMove|| evalValue === this.computerScore || evalValue === this.humanScore || depth === 0){
            return true;
        }
        return false;

    }

    evaluate(board){
        return this.chekWin(board);
    }
    chekWin(gameField){
        let points = 0;

        let vertical_points = 0;
        let horizontal_points = 0;
        let diagonal_points1 = 0;
        let diagonal_points2 = 0;
    
     
        for (let row = 0; row < this.rows - 3; row++) {
 
            for (let column = 0; column < this.cols; column++) {

                let score = this.scorePosition(row, column, 1, 0,gameField);
                if (score === this.computerScore) return this.computerScore;
                if (score === this.humanScore) return this.humanScore;
                vertical_points += score;
            }            
        }
    
       
        for (let row = 0; row < this.rows; row++) {
            for (let column = 0; column < this.cols - 3; column++) { 
                let score = this.scorePosition(row, column, 0, 1,gameField);   
                if (score == this.computerScore) return this.computerScore;
                if (score == this.humanScore) return this.humanScore;
                horizontal_points += score;
            } 
        }
    
    
  
        for (let row = 0; row < this.rows - 3; row++) {
            for (let column = 0; column < this.cols - 3; column++) {
                let score = this.scorePosition(row, column, 1, 1,gameField);
                if (score == this.computerScore) return this.computerScore;
                if (score == this.humanScore) return this.humanScore;
                diagonal_points1 += score;
            }            
        }
    
     
        for (let row = 3; row < this.rows; row++) {
            for (let column = 0; column <= this.cols - 4; column++) {
                let score = this.scorePosition(row, column, -1, +1,gameField);
                if (score == this.computerScore) return this.computerScore;
                if (score == this.humanScore) return this.humanScore;
                diagonal_points2 += score;
            }
    
        }
    
        points = (horizontal_points + vertical_points + diagonal_points1 + diagonal_points2);
        return points;
    }

    scorePosition(row, column, delta_y, delta_x,gameField){
        let human_points = 0;
        let computer_points = 0;

       
        this.winning_array_human = [];
        this.winning_array_cpu = [];

        let consecutive_com_points = 0;
        let consecutive_human_points = 0;
        let temp_row = row;
        let temp_col = column;
        let temp_row1 = row;
        let temp_col1 = column;

       
        for (let i = 0; i < 4; i++) {
            if (gameField[row][column] == 0) {
                this.winning_array_human.push([row, column]);
                human_points++; 
            }
            else if (gameField[row][column] == 1) {
                this.winning_array_cpu.push([row, column]);
                computer_points++; 
            }
            row += delta_y;
            column += delta_x;
        }

        for (let i = 0; i < 4; i++) {
            if (gameField[temp_row][temp_col] == 1) {
                consecutive_com_points++; 
            }
             else if (gameField[temp_row][temp_col] == 0) {
               break; 
            }
            temp_row += delta_y;
            temp_col += delta_x;
        }
        for (let i = 0; i < 4; i++) {
            if (gameField[temp_row1][temp_col1] == 0) {
                consecutive_human_points++; 
            }
             else if (gameField[temp_row1][temp_col1] == 1) {
               break; 
            }
            temp_row += delta_y;
            temp_col += delta_x;
        }

 
        if (human_points == 4) {
            this.winning_array = this.winning_array_human;
            return this.humanScore;
        }
        else if (computer_points == 4) {
            this.winning_array = this.winning_array_cpu;
            return this.computerScore;
        }
        else {
            return (computer_points-human_points) + (consecutive_com_points-consecutive_human_points);
        }
    }

    showWinning(){
        for(let i=0; i<4; i++){
            let r = this.winning_array[i][0];
            let c = this.winning_array[i][1];
            $(`[r-index=${r}][c-index=${c}]`).addClass("winner");

        }
    }

    
    
}

$(document).ready(function(){
    $(".btn_restart").hide();
    let game = new Game();
   
   
})