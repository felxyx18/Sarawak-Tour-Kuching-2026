// ---------- user-defined validation helpers ----------
function isEmpty(v){ return v === null || v === undefined || v.trim().length === 0; }
function isValidEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); }
function isValidPhone(v){ return /^\+?[0-9][0-9\s\-]{7,14}$/.test(v.trim()); }
function setError(field, errBox, msg){ $(errBox).text(msg); $(field).addClass("invalid"); return false; }

// Contact Us form: returns true only if all fields AND consent are valid
function validateContactForm(){
  var ok = true;
  var name = $("#c-name").val(), email = $("#c-email").val(), msg = $("#c-msg").val();
  $("#contact-form .error").text("");
  $("#contact-form .invalid").removeClass("invalid");

  if (isEmpty(name)) ok = setError("#c-name", "#e-name", "Please enter your name.");
  else if (name.trim().length < 2) ok = setError("#c-name", "#e-name", "Name must be at least 2 characters.");

  if (isEmpty(email)) ok = setError("#c-email", "#e-email", "Please enter your email.");
  else if (!isValidEmail(email)) ok = setError("#c-email", "#e-email", "Enter a valid email, e.g. name@example.com.");

  if (isEmpty(msg)) ok = setError("#c-msg", "#e-msg", "Please write a message.");
  else if (msg.trim().length < 10) ok = setError("#c-msg", "#e-msg", "Message must be at least 10 characters.");

  if (!$("#c-consent").is(":checked")) ok = setError("#c-consent", "#e-consent", "You must give consent before sending.");
  return ok;
}

function validateBooking(){
  var date = $("#b-date").val(), people = parseInt($("#b-people").val(), 10);
  $("#booking-form .invalid").removeClass("invalid");
  if (isEmpty($("#b-name").val())) return ["#b-name", "Please enter your name."];
  if (!isValidPhone($("#b-phone").val())) return ["#b-phone", "Enter a valid phone number (8–15 digits)."];
  if (!isValidEmail($("#b-email").val())) return ["#b-email", "Enter a valid email address."];
  if (isEmpty(date)) return ["#b-date", "Please choose a travel date."];
  var today = new Date(); today.setHours(0,0,0,0);
  if (new Date(date) < today) return ["#b-date", "Travel date cannot be in the past."];
  if (isNaN(people) || people < 1 || people > 20) return ["#b-people", "Participants must be between 1 and 20."];
  if ($("#b-pkg").val() === "") return ["#b-pkg", "Please choose a tour package."];
  return null;
}

function updateTotal(){
  var price = parseInt($("#b-pkg option:selected").attr("data-price"), 10);
  var people = parseInt($("#b-people").val(), 10);
  $("#b-total").text(price && people > 0 ? "Estimated total: RM " + (price * people).toLocaleString("en-MY") : "");
}

function todayISO(){
  var d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

$(document).on("pagecreate", function(){
  $("#b-date").attr("min", todayISO());

  // Contact form (modal)
  $("#contact-form").off("submit").on("submit", function(e){
    e.preventDefault();
    if (!validateContactForm()) return;
    $("#c-ok").show();
    setTimeout(function(){
      $("#contact-form")[0].reset();
      $("#c-consent").prop("checked", false).checkboxradio("refresh");
      $("#c-ok").hide();
      $("#contact-modal").popup("close");
    }, 1500);
  });
  $("#contact-modal").off("popupafterclose").on("popupafterclose", function(){
    $("#contact-form .error").text(""); $("#contact-form .invalid").removeClass("invalid");
  });

  // Booking form
  $("#b-pkg, #b-people").off("change keyup").on("change keyup", updateTotal);
  $("#booking-form").off("submit").on("submit", function(e){
    e.preventDefault();
    var err = validateBooking();
    if (err) { $("#b-error").text(err[1]); $(err[0]).addClass("invalid").focus(); return; }
    $("#b-error").text("");
    var pkgName = $("#b-pkg option:selected").text().split(" – ")[0];
    $("#booking-form").hide();
    $("#b-msg").text("Thank you, " + $("#b-name").val().trim() + ". Your booking for " + pkgName + " on " +
      $("#b-date").val() + " (" + $("#b-people").val() + " pax) is confirmed. " + $("#b-total").text() + ".");
    $("#b-success").show();
  });
  $("#b-new").off("click").on("click", function(e){
    e.preventDefault();
    $("#booking-form")[0].reset(); $("#b-pkg").selectmenu("refresh"); updateTotal();
    $("#b-success").hide(); $("#booking-form").show();
  });

  // "Book this package" in popovers: preselect and go to Booking
  $(".book-btn").off("click").on("click", function(e){
    e.preventDefault();
    var key = $(this).data("pkg");
    $(this).closest("[data-role=popup]").popup("close");
    setTimeout(function(){
      $("#b-pkg").val(key).selectmenu("refresh"); updateTotal();
      $.mobile.changePage("#booking", { transition: "slide" });
    }, 300);
  });

  // Tooltip: tap/Enter toggles on touch and keyboard; tap elsewhere closes
  $(".tip").off("click keydown").on("click keydown", function(e){
    if (e.type === "keydown" && e.which !== 13 && e.which !== 32) return;
    e.preventDefault(); e.stopPropagation();
    $(".tip").not(this).removeClass("show"); $(this).toggleClass("show");
  });
  $(document).off("click.tip").on("click.tip", function(){ $(".tip").removeClass("show"); });
});
