let users;
let user_ids_arr;
let current_user;
let posts=[];

// used for table display
let likes_dislikes=[];
let comments_replies=[];
let created_posts = [];
window.onload = execute();

async function execute(){
    await collectUsers().then(() => {
        updateUserUI(null);

        $('#userSearchInput').autocomplete({
            source : user_ids_arr,
        }).attr('style', 'max-height: 40px; overflow-y: auto; overflow-x: hidden;')
    });
}

async function collectUsers() {
    users = [];
    user_ids_arr = [];

    await firebase.database().ref('users').once('value', x => {
        x.forEach(snapshot => {
            users.push(snapshot.val());
            user_ids_arr.push(snapshot.key);
        })
    });
}

function updateUserUI(user_id) {
    collectPosts().then(() => {
                collectUsers().then(() => {

                    if (users.length > 0) {
                        $('#totalUsers').html(`${users.length}`)
                    }

                    if(user_id == null || user_id == undefined){
                        return;
                    }

                    let user;

                    for (let i = 0; i < users.length; i++){
                        if(user_ids_arr[i] == user_id){
                            user = user_ids_arr[i] // if the user is found from the given user_id
                            break;
                        }
                    }

                    if (user == undefined) { // if the user is undefined
                        $("#userError").html("Invalid User Id");
                        return; // exit from the function block
                    } else {
                        $("#userError").html("");
                    }

                    current_user = user_id;

                    firebase.database().ref('users').orderByChild('phone').equalTo(current_user).once('value', x => {
                        x.forEach(snapshot => {
                            current_username = snapshot.val().username;
                            if (current_username !== undefined && current_username !== null) {
                                let user_info_intro = "Information about @" + current_username + ", " + current_user;
                                $("#username").html(user_info_intro);

                                //represent all the total information
                                $("#username").html(user_info_intro);
                            }
                        });

                        //print the cards
                        let cards=
                        `<div class="container-fluid">
                            <div class="row justify-content-center">
                            <div class="col-12">
                                <div class="row">

                                <div class="col-md-4 mb-3">
                                    <div class="card shadow userInfoCard">
                                    <div class="card-header">
                                        Likes on Posts
                                    </div>
                                        <div class="card-body" id="likesOnPosts"> </div>
                                    </div>
                                </div>

                                <div class="col-md-4 mb-3">
                                    <div class="card shadow userInfoCard">
                                    <div class="card-header">
                                        Dislikes on Posts
                                    </div>
                                        <div class="card-body" id="dislikesOnPosts"></div>
                                    </div>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <div class="card shadow userInfoCard">
                                    <div class="card-header">
                                        Comments & Replies
                                        </div>
                                        <div class="card-body" id="commentsReplies"></div>
                                    </div>
                                </div>

                                </div> <!-- .row-->
                            </div> <!-- .col -->
                            </div> <!-- .justify content -->
                        </div> <!-- /.cont fluid -->


                        <div class="container-fluid">
                            <div class="row justify-content-center">
                            <div class="col-12">
                                <div class="row">

                                <div class="col-md-4 mb-3">
                                    <div class="card shadow userInfoCard">
                                    <div class="card-header">
                                        Favourite Posts
                                    </div>
                                        <div class="card-body" id="favouritePosts"></div>
                                    </div>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <div class="card shadow userInfoCard">
                                    <div class="card-header">
                                        Posts Created
                                    </div>
                                        <div class="card-body" id="postsCreated"></div>
                                    </div>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <div class="card shadow userInfoCard">
                                    <div class="card-header">
                                        Likes on Comments
                                    </div>
                                        <div class="card-body" id="likesOnComments"></div>
                                    </div>
                                </div>
                                </div> <!-- /.row -->
                            </div> <!-- /.col -->
                            </div> <!-- /.justify content -->
                        </div> <!-- /.container fluid -->
                        `;
                        $("#card-body").html(cards);


                        let loading_bar=`<div class="spinner-border text-primary" role="status">
                            <span class="sr-only">Loading...</span>
                            </div>`
                            $("#likesOnPosts").html(loading_bar);
                            $("#dislikesOnPosts").html( loading_bar);
                            $("#commentsReplies").html(loading_bar);
                            $("#postsCreated").html(loading_bar);
                            $("#favouritePosts").html( loading_bar);
                            $("#likesOnComments").html(loading_bar);
                    }).then(() => {
                        //updates the total number of likes and dislikes for the chosen user
                        updateLikesDislikes(current_username)
                        //updates the number of replies and comments
                        updateCommentsReplies(current_username)
                        //updates the number of posts favorited by the user
                        updateFavorites(current_user)
                        //updates the number of posts created by the user
                        updatePosts(current_username)
                        //updates the number of likes on comments
                        updateLikesComments(current_username)
                        //updates the pie chart
                        updateChart(current_username,  current_user)
                        //updates the table viewed
                        updateTable();
                    });
                });
            });
}

/**
 * Function used to collect all the posts into an array from firebase
 */
 async function collectPosts(){
    posts = []; // reset posts to 0 / initialize to a list
    await firebase.database().ref('posts')
    .once('value', x => {
        x.forEach(data => {
            posts.push(data.val()); //push the data to the list
        })
    });
}

function updateLikesDislikes(current_username){
    let likes_count=0;
    let dislikes_count=0;
    firebase.database().ref('likesDislikes')
    .once('value', x => {
        x.forEach(data => {
            if(data.val()[current_username] != undefined){ // if the user performed an action on the post
                if (data.val()[current_username].action==1)
                    likes_count+=1;
                else
                    dislikes_count+=1
            }
        })
        $("#likesOnPosts").html(`<h3>${likes_count}</h3>`);
        $("#dislikesOnPosts").html( `<h3>${dislikes_count}</h3>`);
    })
}

function updateCommentsReplies(current_username){
    let comments_replies_count=0;
    firebase.database().ref('comments')
    .once('value', x => {
        x.forEach(data => {
            if(data.val().username== current_username){ // if the user performed an action on the post
                comments_replies_count+=1;
            }
        })
    }).then(() => {
        firebase.database().ref('replies')
        .once('value', x => {
            x.forEach(data => {
                if(data.val().username== current_username){ // if the user performed an action on the post
                    comments_replies_count+=1;
                }
            })
            $("#commentsReplies").html(`<h3>${comments_replies_count}</h3>`);
        })
    });
}

function updatePosts(current_username){
    let posts_count=0;
    created_posts = [];
    for (let i=0; i<posts.length; i++) {
        if (posts[i].username == current_username){
            posts_count+=1
            created_posts.push(posts[i]);
        }
    }
    $("#postsCreated").html(`<h3>${posts_count}</h3>`);

}

function updateFavorites(current_user_phone){
    let favourites=0;
    for (let i=0; i<posts.length; i++) {
        if (posts[i].users_favourite!=undefined){
            for (let k=0; k<posts[i].users_favourite.length; k++){
                if (posts[i].users_favourite[k]==current_user_phone){
                    favourites+=1;
                }
            }
        }
    }
    $("#favouritePosts").html( `<h3>${favourites}</h3>`);
}

function updateLikesComments(current_username){
    let likes_count=0;
    firebase.database().ref('likesComments')
    .once('value', x => {
        x.forEach(data => {
            if(data.val()[current_username] != undefined){ // if the user performed an action on the post
                if (data.val()[current_username].action==1)
                    likes_count+=1;
            }
        })
        $("#likesOnComments").html(`<h3>${likes_count}</h3>`);
    })
}

function updateChart(current_username, current_user_phone){
    //print out the chart
    $("#chart_body").html( `<canvas id="pie-chart-interests" width="500" height="400"></canvas>`);
    //initialize arrays
    let interest_post={};
    let labels_arr=[];
    let data_arr=[];
    let colors_arr=[];

    //colors array
    let colors=["#201c5b", "#282372", "#3831a0", "#483fcd", "#756cfa", "#938dfb", "#c1bdfd", "#002b54", "#003b73", "#0052a1", "#2E97FC", "#73b8fd", "#a2dofd", "#d13c33", "#c2594c", "#co7765", "#d28c76", "#3cb39f", "#5cc2b4", "bcd5c9"]
    //check what inetersts the user created posts with
    for (let i=0; i<posts.length; i++) {
        if (posts[i].username == current_username){
            for (let k=0; k<(posts[i].interest).length; k++){
                if ( interest_post[posts[i].interest[k]] == undefined){
                    interest_post[posts[i].interest[k]] = 1
                }
                else{
                    let temp= interest_post[posts[i].interest[k]]
                    temp+=1;
                    interest_post[posts[i].interest[k]]=temp
                }
            }
        }
    }


    let liked_post_ids=[];
    //check what posts the user liked
    firebase.database().ref('likesDislikes')
    .once('value', x => {
        x.forEach(data => {
            if(data.val()[current_username] != undefined && data.val()[current_username].action==1){ // if the user performed an action on the post
                liked_post_ids.push(data.key)
            }
        })
    }).then(() => {
       //find the interests of those posts
        for (let i=0; i<posts.length; i++) {
            for (let j=0; j<liked_post_ids.length; j++){
                if (posts[i].id==liked_post_ids[j]){
                    for (let k=0; k<(posts[i].interest).length; k++){
                        if (interest_post[posts[i].interest[k]] == undefined){
                            interest_post[posts[i].interest[k]] = 1
                        }
                        else{
                            let temp= interest_post[posts[i].interest[k]]
                            temp+=1;
                            interest_post[posts[i].interest[k]]=temp
                        }
                    }
                }
            }
        }

        let commented_posts_ids=[]
        //check what posts the user commented
        firebase.database().ref('comments')
        .once('value', x => {
            x.forEach(data => {
                if(data.val().username == current_username){ // if the user performed an action on the post
                    commented_posts_ids.push(data.val().postID)
                }
            })
        }).then(() => {
            //find the interests of those posts
            for (let i=0; i<posts.length; i++) {
                for (let j=0; j<commented_posts_ids.length; j++){
                    if (posts[i].id==commented_posts_ids[j]){
                        for (let k=0; k<(posts[i].interest).length; k++){
                            if (interest_post[posts[i].interest[k]] == undefined){
                                interest_post[posts[i].interest[k]] = 1
                            }
                            else{
                                let temp= interest_post[posts[i].interest[k]]
                                temp+=1;
                                interest_post[posts[i].interest[k]]=temp
                            }
                        }
                    }
                }
            }

           //favourited posts
            for (let i=0; i<posts.length; i++) {
                if (posts[i].users_favourite!=undefined)
                {
                    for (let j=0; j<posts[i].users_favourite.length; j++)
                    {
                        console.log(posts[i].users_favourite[j])
                        if (posts[i].users_favourite[j]==current_user_phone){
                            console.log('hi')
                            for (let k=0; k<(posts[i].interest).length; k++){
                                if ( interest_post[posts[i].interest[k]] == undefined){
                                    interest_post[posts[i].interest[k]] = 1
                                }
                                else{
                                    let temp= interest_post[posts[i].interest[k]]
                                    temp+=1;
                                    interest_post[posts[i].interest[k]]=temp
                                }
                            }
                        }
                    }
                }
            }

            //filling up labels and data sets
            Object.entries(interest_post).forEach(([k,v]) => {
                labels_arr.push(k)
                data_arr.push(v)
            })

            //fill up colors
            for (let i=0; i<data_arr.length; i++){
                colors_arr.push(colors[i])
            }

            if (labels_arr.length>0){
                new Chart(document.getElementById("pie-chart-interests"), {
                    type: 'pie',
                    data: {
                    labels: labels_arr,
                    datasets: [{
                        //label: "Population (millions)",
                        backgroundColor: colors_arr,
                        data: data_arr
                    }]
                    },
                });
            }
            else{
                $("#chart_body").html( `<h5 style="text-align: center">No Actions performed</h5>`);
            }
        });
    });
}


/* Function that updates the table that is displayed for the user based on the value of the checked radio
*
*/
function updateTable(){
  let checked_value =  document.getElementById('tableDisplay').value;

  if (checked_value == "createdPosts"){
    displayCreatedPosts();
  } else if (checked_value == "likedPosts") {

  } else if (checked_value == "dislikedPosts"){

  } else if (checked_value == "comments"){

  } else if (checked_value == "favouritePosts") {

  } else if (checked_value == "likedComments"){

  }
}

/* Table that is used to display the created posts by the user
*/
function displayCreatedPosts(){
  //outputing the rows of posts
  console.log(created_posts)
  let display_table = document.getElementById("tableDisplayRow");
  let output_rows = "<table class='pure-table' id='historyTable'><thead><th>Post Id</th><th>Post Title</th><th>Post link</th></thead><tbody>";
  for (let i = 0; i < created_posts.length; i++){
    let post = created_posts[i];
    output_rows += "<tr><td>" + post.id + "</td><td> " + post.title + " </td><td>";
    output_rows += `<div> <button class='btn btn-primary'  id='more_btn' onclick="transfer_admin_post('${post.id}');"> View More </button> </div>`;
    output_rows += "</td></tr>";

  }

  output_rows += "</tbody></table>";
  display_table.innerHTML = output_rows;


}


/**
 Function that transfer the admin to the post analytics detial page
 * @param {*} post_id the post id of the post the admin wants to access
 */
function transfer_admin_post(post_id){
  localStorage.setItem("POST_ID", post_id);
  window.location = "./forum_post.html";

}

// update posts on an interval (10 sec) to mimic realtime dashboard
setInterval(
    async function(){
    collectUsers().then(()=>{
        if (current_user == undefined || current_user == null) {
            updateUserUI(null);
        } else {
            updateUserUI(current_user);
        }
    });
}, 30000);
