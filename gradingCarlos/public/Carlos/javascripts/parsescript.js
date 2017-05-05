$(function() {
  $(".parse").click(function () {
    $('#img').show();
    $("#parsingResult").hide();
    $(this).prop("disabled",true);
    $.ajax({
      type: 'POST',
      url: '/Carlos/parsing',
      success: function(result) {
         $(".parse").prop("disabled",false);
         $('#img').hide();
         $("#parsingResult").attr("src","/Carlos/parsing/result.png");
         $("#parsingResult").show();
      },
      error: function (request, error) {
        $(".parse").prop("disabled",false);
      },
    });
  });
});
