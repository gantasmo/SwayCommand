# Ui.ps1 — the installer window.
#
# WPF via Windows PowerShell 5.1, which is the only GUI toolkit guaranteed to be
# present before anything has been installed. Deliberately quiet: one neutral
# surface, one restrained bone-coloured progress fill, no status lights, no
# saturated colour anywhere. State is carried by typography, not by hue.

Add-Type -AssemblyName PresentationFramework, PresentationCore, WindowsBase, System.Xaml, System.Windows.Forms -ErrorAction Stop

$script:BootstrapXaml = @'
<Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="SwayCommand Setup"
        Width="780" Height="700"
        WindowStartupLocation="CenterScreen"
        WindowStyle="None" AllowsTransparency="True" Background="Transparent"
        ResizeMode="NoResize"
        FontFamily="Segoe UI Variable Text, Segoe UI"
        TextOptions.TextFormattingMode="Ideal"
        TextOptions.TextRenderingMode="ClearType">

  <Window.Resources>
    <SolidColorBrush x:Key="Surface"    Color="#131316"/>
    <SolidColorBrush x:Key="Raised"     Color="#17171B"/>
    <SolidColorBrush x:Key="Hairline"   Color="#26262B"/>
    <SolidColorBrush x:Key="TextHigh"   Color="#EDEDEF"/>
    <SolidColorBrush x:Key="TextMid"    Color="#96969E"/>
    <SolidColorBrush x:Key="TextLow"    Color="#63636B"/>
    <SolidColorBrush x:Key="Track"      Color="#26262B"/>

    <LinearGradientBrush x:Key="Fill" StartPoint="0,0" EndPoint="0,1">
      <GradientStop Color="#E8E4DC" Offset="0"/>
      <GradientStop Color="#C4BFB5" Offset="1"/>
    </LinearGradientBrush>

    <Style x:Key="Primary" TargetType="Button">
      <Setter Property="Background" Value="#EDEDEF"/>
      <Setter Property="Foreground" Value="#131316"/>
      <Setter Property="BorderThickness" Value="0"/>
      <Setter Property="Padding" Value="22,9"/>
      <Setter Property="FontSize" Value="13"/>
      <Setter Property="Cursor" Value="Hand"/>
      <Setter Property="Template">
        <Setter.Value>
          <ControlTemplate TargetType="Button">
            <Border x:Name="b" Background="{TemplateBinding Background}" CornerRadius="5"
                    Padding="{TemplateBinding Padding}" SnapsToDevicePixels="True">
              <ContentPresenter HorizontalAlignment="Center" VerticalAlignment="Center"/>
            </Border>
            <ControlTemplate.Triggers>
              <Trigger Property="IsMouseOver" Value="True">
                <Setter TargetName="b" Property="Background" Value="#FFFFFF"/>
              </Trigger>
              <Trigger Property="IsEnabled" Value="False">
                <Setter TargetName="b" Property="Background" Value="#3A3A41"/>
                <Setter Property="Foreground" Value="#8A8A92"/>
              </Trigger>
            </ControlTemplate.Triggers>
          </ControlTemplate>
        </Setter.Value>
      </Setter>
    </Style>

    <Style x:Key="Ghost" TargetType="Button">
      <Setter Property="Background" Value="Transparent"/>
      <Setter Property="Foreground" Value="#C9C9D0"/>
      <Setter Property="Padding" Value="18,9"/>
      <Setter Property="FontSize" Value="13"/>
      <Setter Property="Cursor" Value="Hand"/>
      <Setter Property="Template">
        <Setter.Value>
          <ControlTemplate TargetType="Button">
            <Border x:Name="b" Background="{TemplateBinding Background}" CornerRadius="5"
                    BorderBrush="#33333A" BorderThickness="1"
                    Padding="{TemplateBinding Padding}" SnapsToDevicePixels="True">
              <ContentPresenter HorizontalAlignment="Center" VerticalAlignment="Center"/>
            </Border>
            <ControlTemplate.Triggers>
              <Trigger Property="IsMouseOver" Value="True">
                <Setter TargetName="b" Property="Background" Value="#1D1D22"/>
              </Trigger>
              <Trigger Property="IsEnabled" Value="False">
                <Setter Property="Foreground" Value="#4E4E56"/>
              </Trigger>
            </ControlTemplate.Triggers>
          </ControlTemplate>
        </Setter.Value>
      </Setter>
    </Style>

    <Style x:Key="Quiet" TargetType="Button">
      <Setter Property="Background" Value="Transparent"/>
      <Setter Property="Foreground" Value="#8A8A92"/>
      <Setter Property="BorderThickness" Value="0"/>
      <Setter Property="Padding" Value="6,3"/>
      <Setter Property="FontSize" Value="12"/>
      <Setter Property="Cursor" Value="Hand"/>
      <Setter Property="Template">
        <Setter.Value>
          <ControlTemplate TargetType="Button">
            <Border Background="Transparent" Padding="{TemplateBinding Padding}">
              <TextBlock x:Name="t" Text="{TemplateBinding Content}"
                         Foreground="{TemplateBinding Foreground}" FontSize="{TemplateBinding FontSize}"/>
            </Border>
            <ControlTemplate.Triggers>
              <Trigger Property="IsMouseOver" Value="True">
                <Setter TargetName="t" Property="Foreground" Value="#EDEDEF"/>
              </Trigger>
            </ControlTemplate.Triggers>
          </ControlTemplate>
        </Setter.Value>
      </Setter>
    </Style>

    <Style TargetType="CheckBox">
      <Setter Property="Foreground" Value="#EDEDEF"/>
      <Setter Property="Cursor" Value="Hand"/>
    </Style>
  </Window.Resources>

  <Border Background="{StaticResource Surface}" CornerRadius="10" BorderBrush="#2A2A30" BorderThickness="1">
    <Border.Effect>
      <DropShadowEffect BlurRadius="34" ShadowDepth="10" Direction="270" Opacity="0.55" Color="#000000"/>
    </Border.Effect>

    <Grid Margin="1">
      <Grid.RowDefinitions>
        <RowDefinition Height="Auto"/>
        <RowDefinition Height="Auto"/>
        <RowDefinition Height="*"/>
        <RowDefinition Height="Auto"/>
      </Grid.RowDefinitions>

      <!-- title bar -->
      <Grid x:Name="TitleBar" Grid.Row="0" Height="46" Background="Transparent">
        <TextBlock Text="SwayCommand" Foreground="{StaticResource TextMid}" FontSize="12"
                   VerticalAlignment="Center" Margin="26,0,0,0"/>
        <Button x:Name="CloseButton" Style="{StaticResource Quiet}" Content="&#x2715;"
                HorizontalAlignment="Right" VerticalAlignment="Center" Margin="0,0,18,0" FontSize="13"/>
      </Grid>

      <!-- headline -->
      <StackPanel Grid.Row="1" Margin="40,10,40,26">
        <TextBlock x:Name="Headline" Text="Checking your system" Foreground="{StaticResource TextHigh}"
                   FontSize="27" FontWeight="Light" TextWrapping="Wrap"/>
        <TextBlock x:Name="Subhead" Text="" Foreground="{StaticResource TextMid}" FontSize="13"
                   Margin="0,9,0,0" TextWrapping="Wrap"/>
      </StackPanel>

      <!-- body -->
      <Grid Grid.Row="2" Margin="40,0,40,0">
        <ScrollViewer x:Name="ListScroller" VerticalScrollBarVisibility="Auto" HorizontalScrollBarVisibility="Disabled">
          <StackPanel x:Name="StepList"/>
        </ScrollViewer>

        <Border x:Name="FailureCard" Visibility="Collapsed" Background="{StaticResource Raised}"
                CornerRadius="8" BorderBrush="{StaticResource Hairline}" BorderThickness="1" Padding="26,22">
          <StackPanel>
            <TextBlock x:Name="FailureTitle" Text="" Foreground="{StaticResource TextHigh}" FontSize="16"
                       FontWeight="SemiBold" TextWrapping="Wrap"/>
            <TextBlock x:Name="FailureBody" Text="" Foreground="{StaticResource TextMid}" FontSize="13"
                       Margin="0,12,0,0" TextWrapping="Wrap" LineHeight="20"/>
            <StackPanel Orientation="Horizontal" Margin="0,22,0,0">
              <Button x:Name="RetryButton" Style="{StaticResource Primary}" Content="Try again"/>
              <Button x:Name="SkipButton" Style="{StaticResource Ghost}" Content="Skip this" Margin="10,0,0,0"/>
              <Button x:Name="LogButton" Style="{StaticResource Ghost}" Content="Open log" Margin="10,0,0,0"/>
            </StackPanel>
          </StackPanel>
        </Border>
      </Grid>

      <!-- footer -->
      <StackPanel Grid.Row="3" Margin="40,24,40,28">
        <Border x:Name="TrackBorder" Height="3" CornerRadius="2" Background="{StaticResource Track}"
                HorizontalAlignment="Stretch">
          <Border x:Name="FillBorder" Height="3" CornerRadius="2" Background="{StaticResource Fill}"
                  HorizontalAlignment="Left" Width="0"/>
        </Border>

        <Grid Margin="0,14,0,0">
          <StackPanel Orientation="Horizontal" HorizontalAlignment="Left">
            <TextBlock x:Name="ElapsedText" Text="" Foreground="{StaticResource TextLow}" FontSize="12"/>
            <TextBlock x:Name="RemainingText" Text="" Foreground="{StaticResource TextLow}" FontSize="12" Margin="18,0,0,0"/>
          </StackPanel>
          <StackPanel x:Name="LocationPanel" Orientation="Horizontal" HorizontalAlignment="Left" Visibility="Collapsed">
            <TextBlock x:Name="LocationText" Text="" Foreground="{StaticResource TextLow}" FontSize="12"
                       TextTrimming="CharacterEllipsis" MaxWidth="420"/>
            <Button x:Name="ChangeLocationButton" Style="{StaticResource Quiet}" Content="Change" Margin="10,0,0,0"/>
          </StackPanel>
          <StackPanel Orientation="Horizontal" HorizontalAlignment="Right">
            <Button x:Name="SecondaryButton" Style="{StaticResource Ghost}" Content="Cancel" Visibility="Collapsed"/>
            <Button x:Name="ActionButton" Style="{StaticResource Primary}" Content="Install and launch"
                    Margin="10,0,0,0" Visibility="Collapsed"/>
          </StackPanel>
        </Grid>
      </StackPanel>
    </Grid>
  </Border>
</Window>
'@

function New-BootstrapWindow {
    $reader = New-Object System.Xml.XmlNodeReader ([xml]$script:BootstrapXaml)
    $window = [Windows.Markup.XamlReader]::Load($reader)

    $ui = @{ Window = $window }
    foreach ($name in @(
        'TitleBar', 'CloseButton', 'Headline', 'Subhead', 'StepList', 'ListScroller',
        'FailureCard', 'FailureTitle', 'FailureBody', 'RetryButton', 'SkipButton', 'LogButton',
        'TrackBorder', 'FillBorder', 'ElapsedText', 'RemainingText',
        'LocationPanel', 'LocationText', 'ChangeLocationButton',
        'ActionButton', 'SecondaryButton'
    )) {
        $ui[$name] = $window.FindName($name)
    }

    # Frameless windows still have to be draggable.
    $ui.TitleBar.Add_MouseLeftButtonDown({
        param($src, $e)
        # TitleBar -> outer Grid -> rounded Border -> Window
        if ($e.ButtonState -eq 'Pressed') { $src.Parent.Parent.Parent.DragMove() }
    })
    return $ui
}

function New-StepRow {
    <#
      One row per graph node. Optional nodes get a checkbox; required ones get a
      fixed-width glyph column so both kinds line up on the same grid.
    #>
    param($Step)

    $row = New-Object System.Windows.Controls.Grid
    $row.Margin = '0,0,0,1'
    $row.MinHeight = 46

    foreach ($w in @('26', '*', 'Auto')) {
        $col = New-Object System.Windows.Controls.ColumnDefinition
        if ($w -eq '*') { $col.Width = New-Object System.Windows.GridLength(1, ([System.Windows.GridUnitType]::Star)) }
        elseif ($w -eq 'Auto') { $col.Width = [System.Windows.GridLength]::Auto }
        else { $col.Width = New-Object System.Windows.GridLength([double]$w) }
        $row.ColumnDefinitions.Add($col)
    }

    $glyph = New-Object System.Windows.Controls.TextBlock
    $glyph.FontSize = 13
    $glyph.VerticalAlignment = 'Center'
    $glyph.Foreground = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.ColorConverter]::ConvertFromString('#63636B'))
    [System.Windows.Controls.Grid]::SetColumn($glyph, 0)
    $row.Children.Add($glyph) | Out-Null

    $check = $null
    if ($Step.Optional) {
        $check = New-Object System.Windows.Controls.CheckBox
        $check.VerticalAlignment = 'Center'
        $check.IsChecked = [bool]$Step.Selected
        [System.Windows.Controls.Grid]::SetColumn($check, 0)
        $row.Children.Add($check) | Out-Null
        $glyph.Visibility = 'Collapsed'
    }

    $texts = New-Object System.Windows.Controls.StackPanel
    $texts.Margin = '4,10,20,10'
    [System.Windows.Controls.Grid]::SetColumn($texts, 1)

    $name = New-Object System.Windows.Controls.TextBlock
    $name.Text = $Step.Name
    $name.FontSize = 13.5
    $name.Foreground = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.ColorConverter]::ConvertFromString('#EDEDEF'))
    $texts.Children.Add($name) | Out-Null

    $detail = New-Object System.Windows.Controls.TextBlock
    $detail.Text = ''
    $detail.FontSize = 12
    $detail.Margin = '0,3,0,0'
    $detail.TextWrapping = 'Wrap'
    $detail.Foreground = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.ColorConverter]::ConvertFromString('#7C7C85'))
    $texts.Children.Add($detail) | Out-Null
    $row.Children.Add($texts) | Out-Null

    $status = New-Object System.Windows.Controls.TextBlock
    $status.FontSize = 12
    $status.VerticalAlignment = 'Center'
    $status.Foreground = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.ColorConverter]::ConvertFromString('#96969E'))
    [System.Windows.Controls.Grid]::SetColumn($status, 2)
    $row.Children.Add($status) | Out-Null

    $rule = New-Object System.Windows.Controls.Border
    $rule.Height = 1
    $rule.Background = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.ColorConverter]::ConvertFromString('#1E1E23'))
    $rule.VerticalAlignment = 'Bottom'
    [System.Windows.Controls.Grid]::SetColumnSpan($rule, 3)
    $row.Children.Add($rule) | Out-Null

    return @{
        Root = $row; Glyph = $glyph; Check = $check
        Name = $name; Detail = $detail; Status = $status
    }
}

function Get-StepPresentation {
    # The whole status vocabulary, in one place. Monochrome by design.
    param($Step)
    switch ($Step.State) {
        'satisfied' { return @{ Glyph = [char]0x2713; Status = 'Ready';      Dim = $true } }
        'done'      { return @{ Glyph = [char]0x2713; Status = 'Installed';  Dim = $false } }
        'running'   { return @{ Glyph = [char]0x203A; Status = 'Working';    Dim = $false } }
        'failed'    { return @{ Glyph = '!';          Status = 'Failed';     Dim = $false } }
        'skipped'   { return @{ Glyph = [char]0x2013; Status = 'Skipped';    Dim = $true } }
        default {
            if ($Step.Optional) { return @{ Glyph = ''; Status = 'Optional'; Dim = $true } }
            return @{ Glyph = [char]0x2013; Status = 'Will install'; Dim = $true }
        }
    }
}

function Select-InstallFolder {
    param([string]$Current)
    $dialog = New-Object System.Windows.Forms.FolderBrowserDialog
    $dialog.Description = 'Where should SwayCommand keep its private runtime and downloads?'
    $dialog.ShowNewFolderButton = $true
    if (Test-Path -LiteralPath $Current) { $dialog.SelectedPath = $Current }
    if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) { return $dialog.SelectedPath }
    return $null
}
