$(function() {
  $(".toggleType").change(function () {
     var value = $(this).val();
     var currentTenant = $("input[type=hidden]").val();
    $.ajax({
      type: 'POST',
      url: '/Carlos/tenantstest',
      async: true,
      data: {
            action1: value, // as you are getting in php $_POST['action1'],
            action2: currentTenant
      },
      success: function(result) {
      }
    });
  });
});
