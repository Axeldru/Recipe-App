const options = {
  method: "GET",
  headers: {
    "X-RapidAPI-Key": "9c8b8c4566mshf0233f3b503a49ep135b4ejsn92eed5ca7bb4",
    "X-RapidAPI-Host": "tasty.p.rapidapi.com",
  },
};
let searchBtn = document.querySelector("#search-btn");
let clearBtn = document.querySelector("#clear-btn");
let recipeInput = document.querySelector("#recipe-input");

//Events
searchBtn.addEventListener("click", searchRecipes);
clearBtn.addEventListener("click", clearRecipes);
recipeInput.addEventListener("keydown", function (e) {
  if (e.keyCode === 13) {
    searchRecipes();
  }
});

//Deleting recipe cards before new search
function clearRecipes() {
  let recipes = document.querySelectorAll(".recipe");
  recipes.forEach((recipe) => recipe.remove());
}

//Get ingredient name to search
function searchRecipes() {
  let inputElement = document.querySelector("#recipe-input");
  filterRecipes(inputElement.value);
  inputElement.value = "";
}

//Search for ingredients in recipes
async function filterRecipes(searchIngredient) {
  const url = "https://tasty.p.rapidapi.com/recipes/list?from=0&size=50";

  try {
    const response = await fetch(url, options);
    if (response.ok) {
      const data = await response.json();

      let arrSearchRecipes = [];
      searchIngredient = searchIngredient.toLowerCase().trim();

      //Search for an ingredient in the list
      data.results.forEach(function (el) {
        el.sections.forEach(function (el1) {
          el1.components.forEach(function (el2) {
            if (
              el2.ingredient.name
                .toLowerCase()
                .trim()
                .search(searchIngredient) != -1
            ) {
              arrSearchRecipes.push(el);
            }
          });
        });
      });

      //Displaying found recipes
      if (arrSearchRecipes.length > 0) {
        //Remove duplicate recipes
        arrSearchRecipes = [...new Set(arrSearchRecipes)];
        //arrSearchRecipes = Array.from(new Set(arrSearchRecipes));

        //Remove previous recipes from the screen
        clearRecipes();

        //Show new recipes
        displayRecipes(arrSearchRecipes);
      } else {
        alert("No recipes with this ingredient found!");
      }
    } else {
      console.error("Failed to fetch the list of recipes");
    }
  } catch (error) {
    console.error(error);
  }
}

async function fetchAndDisplayRecipes() {
  const recipesUrl = "https://tasty.p.rapidapi.com/recipes/list?from=0&size=50";

  try {
    const response = await fetch(recipesUrl, options);
    if (response.ok) {
      const data = await response.json();
      displayRecipes(data.results);
    } else {
      console.error("Failed to fetch the list of recipes");
    }
  } catch (error) {
    console.error(error);
  }
}

function displayRecipes(recipes) {
  const recipesSection = document.getElementById("recipes");

  recipes.forEach((recipe) => {
    const recipeElement = document.createElement("div");
    recipeElement.classList.add("recipe");

    // Add data attribute for tags without displaying them
    recipeElement.setAttribute("data-tags", recipe.tags.join(", "));

    recipeElement.innerHTML = `
		  <h3>${recipe.name}</h3>
		  <img src="${recipe.thumbnail_url}" alt="${recipe.name}" />
		  <p>${recipe.description}</p>
		  <button onclick="fetchRecipeDetails(${recipe.id})">Get Recipe</button>
		  <div id="recipeDetails${recipe.id}"></div>
		`;

    recipesSection.appendChild(recipeElement);
  });
}

async function fetchRecipeDetails(recipeId) {
  const recipeDetailsUrl = `https://tasty.p.rapidapi.com/recipes/get-more-info?id=${recipeId}`;

  try {
    const response = await fetch(recipeDetailsUrl, options);
    if (response.ok) {
      const data = await response.json();
      displayRecipeDetails(data, recipeId);
    } else {
      console.error(`Failed to fetch details for recipe with ID ${recipeId}`);
    }
  } catch (error) {
    console.error(error);
  }
}

function displayRecipeDetails(recipeDetails, recipeId) {
  const detailsElement = document.getElementById(`recipeDetails${recipeId}`);

  let preparationTime = "Not available";
  if (
    recipeDetails.total_time_tier &&
    recipeDetails.total_time_tier.display_tier
  ) {
    preparationTime = recipeDetails.total_time_tier.display_tier;
  }

  let nutritionCalories = "Not available";
  if (recipeDetails.nutrition) {
    const nutrition = recipeDetails.nutrition;
    nutritionCalories = `${nutrition.calories} calories, ${nutrition.carbohydrates}g carbs, ${nutrition.fat}g fat, ${nutrition.protein}g protein, ${nutrition.sugar}g sugar, ${nutrition.fiber}g fiber`;
  }

  let instructionsHtml = "";
  if (recipeDetails.instructions) {
    instructionsHtml = "<p>Instructions:</p>";
    recipeDetails.instructions.forEach((instruction, index) => {
      if (instruction.display_text) {
        instructionsHtml += `<p>${index + 1}. ${instruction.display_text}</p>`;
      }
    });
  }

  let videoHtml = "";
  if (recipeDetails.original_video_url) {
    videoHtml = `<p>Video: <a href="${recipeDetails.original_video_url}" target="_blank">Watch Recipe Video</a></p>`;
  }

  detailsElement.innerHTML = `
			<p>Preparation Time: ${preparationTime}</p>
			<p>Nutrition Info: ${nutritionCalories}</p>
			${instructionsHtml}
			${videoHtml}
		`;
}

fetchAndDisplayRecipes();
