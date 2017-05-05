$(function() {
  $(".parse").click(function () {
    $('#img').show();
    $("#parsingResult").hide();
    $(this).prop("disabled",true);
    $.ajax({
      type: 'POST',
      url: '/Kang/parsing',
      success: function(result) {
         $(".parse").prop("disabled",false);
         $('#img').hide();
         $("#parsingResult").attr("src","/Kang/parsing/result.png");
         $("#parsingResult").show();
      },
      error: function (request, error) {
        $(".parse").prop("disabled",false);
      },
    });
  });
});
